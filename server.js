import express from "express";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Session
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, secure: false },
  })
);
const port = 3000;

// Static
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));

// Body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// JSON error
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next(err);
});

// DATABASE — FIXED: Serialize + Callbacks
const db = new sqlite3.Database("users.db", (err) => {
  if (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }
  console.log("Connected to users.db");

  db.serialize(() => {
    // Users table with UNIQUE constraints
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`,
      (err) => {
        if (err) console.error("Users table error:", err.message);
        else console.log("Users table ready.");
      }
    );

    // Traits table
    db.run(
      `CREATE TABLE IF NOT EXISTS user_traits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        empathy INTEGER DEFAULT 0,
        responsibility INTEGER DEFAULT 0,
        courage INTEGER DEFAULT 0,
        fear INTEGER DEFAULT 0,
        selfishness INTEGER DEFAULT 0,
        dishonesty INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id)
      )`,
      (err) => {
        if (err) console.error("Traits table error:", err.message);
        else console.log("Traits table ready.");
      }
    );
  });
});

// Pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "view", "index.html")));
app.get("/auth.html", (req, res) => res.sendFile(path.join(__dirname, "view", "auth.html")));

// REGISTER — FULLY FIXED
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.redirect("/auth.html?error=All fields required.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.redirect("/auth.html?error=Invalid email.");
  }
  if (password.length < 6) {
    return res.redirect("/auth.html?error=Password must be 6+ chars.");
  }

  const checkSql = `SELECT id FROM users WHERE username = ? OR email = ?`;
  db.get(checkSql, [username, email], (err, row) => {
    if (err) {
      console.error("DB check error:", err.message);
      return res.redirect("/auth.html?error=Server error.");
    }
    if (row) {
      return res.redirect("/auth.html?error=Username or email already taken.");
    }

    db.run(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, password],
      function (err) {
        if (err) {
          console.error("Insert error:", err.message);
          return res.redirect("/auth.html?error=Registration failed.");
        }

        req.session.user = { id: this.lastID, username };
        req.session.showWelcome = true;
        req.session.save(() => res.redirect("/phaser.html"));
      }
    );
  });
});

// LOGIN — FIXED
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.redirect("/auth.html?error=Username and password required.");
  }

  db.get(
    `SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => {
      if (err || !row) {
        return res.redirect("/auth.html?error=Invalid username or password.");
      }
      req.session.user = { id: row.id, username: row.username };
      req.session.showWelcome = true;
      req.session.save(() => res.redirect("/phaser.html"));
    }
  );
});

// API Routes
app.get("/api/user", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in" });
  const showWelcome = req.session.showWelcome || false;
  if (showWelcome) req.session.showWelcome = false;
  res.json({ user: req.session.user, showWelcome });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.post("/api/traits/save", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in" });
  const { traits } = req.body;
  if (!traits) return res.status(400).json({ error: "Traits required" });

  const sql = `INSERT INTO user_traits (user_id, empathy, responsibility, courage, fear, selfishness, dishonesty)
               VALUES (?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(user_id) DO UPDATE SET
                 empathy = excluded.empathy,
                 responsibility = excluded.responsibility,
                 courage = excluded.courage,
                 fear = excluded.fear,
                 selfishness = excluded.selfishness,
                 dishonesty = excluded.dishonesty,
                 updated_at = CURRENT_TIMESTAMP`;

  db.run(sql, [
    req.session.user.id,
    traits.empathy || 0,
    traits.responsibility || 0,
    traits.courage || 0,
    traits.fear || 0,
    traits.selfishness || 0,
    traits.dishonesty || 0,
  ], (err) => {
    if (err) return res.status(500).json({ error: "Save failed" });
    res.json({ success: true });
  });
});

app.get("/api/traits/get", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in" });
  db.get(`SELECT * FROM user_traits WHERE user_id = ?`, [req.session.user.id], (err, row) => {
    res.json({ traits: row || { empathy: 0, responsibility: 0, courage: 0, fear: 0, selfishness: 0, dishonesty: 0 } });
  });
});

app.get("/api/traits/all", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in" });
  db.all(`SELECT u.username, t.* FROM user_traits t JOIN users u ON t.user_id = u.id ORDER BY t.updated_at DESC`, [], (err, rows) => {
    res.json({ users: rows || [] });
  });
});

// Protected
app.get("/phaser.html", (req, res) => {
  if (!req.session.user) return res.redirect("/auth.html");
  res.sendFile(path.join(__dirname, "public/phaser.html"));
});

app.get("/dashboard.html", (req, res) => {
  if (!req.session.user) return res.redirect("/auth.html");
  res.sendFile(path.join(__dirname, "view/dashboard.html"));
});

// 404 & Error
app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server error" });
});

// Start
app.listen(port, () => console.log(`http://localhost:${port}`));