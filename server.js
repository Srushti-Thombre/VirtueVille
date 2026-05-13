import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createClient } from "@libsql/client";
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
const PORT = process.env.PORT || 3000;

// Turso DB Client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Database Initialization
async function initDB() {
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS user_traits (
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
    )`);

    console.log("Tables ready.");
  } catch (err) {
    console.error("DB initialization failed:", err.message);
    process.exit(1);
  }
}

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

// Pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "view", "index.html")));
app.get("/auth.html", (req, res) => res.sendFile(path.join(__dirname, "view", "auth.html")));

// REGISTER
app.post("/register", async (req, res) => {
  try {
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

    const checkResult = await db.execute({
      sql: `SELECT id FROM users WHERE username = ? OR email = ?`,
      args: [username, email],
    });

    if (checkResult.rows.length > 0) {
      return res.redirect("/auth.html?error=Username or email already taken.");
    }

    const insertResult = await db.execute({
      sql: `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      args: [username, email, password],
    });

    req.session.user = { id: insertResult.lastInsertRowid, username };
    req.session.showWelcome = true;
    req.session.save(() => res.redirect("/phaser.html"));
  } catch (err) {
    console.error("Register error:", err.message);
    res.redirect("/auth.html?error=Registration failed.");
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.redirect("/auth.html?error=Username and password required.");
    }

    const result = await db.execute({
      sql: `SELECT * FROM users WHERE username = ? AND password = ?`,
      args: [username, password],
    });

    if (result.rows.length === 0) {
      return res.redirect("/auth.html?error=Invalid username or password.");
    }

    const row = result.rows[0];
    req.session.user = { id: row.id, username: row.username };
    req.session.showWelcome = true;
    req.session.save(() => res.redirect("/phaser.html"));
  } catch (err) {
    console.error("Login error:", err.message);
    res.redirect("/auth.html?error=Server error.");
  }
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

app.post("/api/traits/save", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: "Not logged in" });
    const { traits } = req.body;
    if (!traits) return res.status(400).json({ error: "Traits required" });

    await db.execute({
      sql: `INSERT INTO user_traits (user_id, empathy, responsibility, courage, fear, selfishness, dishonesty)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id) DO UPDATE SET
               empathy = excluded.empathy,
               responsibility = excluded.responsibility,
               courage = excluded.courage,
               fear = excluded.fear,
               selfishness = excluded.selfishness,
               dishonesty = excluded.dishonesty,
               updated_at = CURRENT_TIMESTAMP`,
      args: [
        req.session.user.id,
        traits.empathy || 0,
        traits.responsibility || 0,
        traits.courage || 0,
        traits.fear || 0,
        traits.selfishness || 0,
        traits.dishonesty || 0,
      ],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Traits save error:", err.message);
    res.status(500).json({ error: "Save failed" });
  }
});

app.get("/api/traits/get", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: "Not logged in" });

    const result = await db.execute({
      sql: `SELECT * FROM user_traits WHERE user_id = ?`,
      args: [req.session.user.id],
    });

    const traits = result.rows[0] || {
      empathy: 0,
      responsibility: 0,
      courage: 0,
      fear: 0,
      selfishness: 0,
      dishonesty: 0,
    };

    res.json({ traits });
  } catch (err) {
    console.error("Traits get error:", err.message);
    res.status(500).json({ error: "Failed to fetch traits" });
  }
});

app.get("/api/traits/all", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: "Not logged in" });

    const result = await db.execute({
      sql: `SELECT u.username, t.* FROM user_traits t JOIN users u ON t.user_id = u.id ORDER BY t.updated_at DESC`,
      args: [],
    });

    res.json({ users: result.rows || [] });
  } catch (err) {
    console.error("Traits all error:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
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

// Start Server
(async () => {
  await initDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();