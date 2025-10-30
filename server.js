import express from "express";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Error handling middleware for session errors
app.use(
  session({
    secret: "mysecretkey", // Change this to a strong random string in production
    resave: false,
    saveUninitialized: false, // Don't create session until something is stored
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: false, // Set to true if using HTTPS
    },
  })
);
const port = 3000;

// Handle favicon.ico requests silently
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Serve static files from both root directory and public folder
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, "public")));

// Middleware to handle form and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Global error handler for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("JSON Parse Error:", err.message);
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  next(err);
});

// Database connection with enhanced error handling
const db = new sqlite3.Database("users.db", (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // Exit if database fails
  } else {
    console.log("✅ Connected to the users.db database.");

    db.run(
      `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
             email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )`,
      (err) => {
        if (err) {
          console.error("❌ Table creation failed:", err.message);
        } else {
          console.log("✅ Users table ready.");
          db.run(
            `INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)`,
            ["admin", "admin@example.com", "password123"],

            (err) => {
              if (err) {
                console.error("❌ Test user creation failed:", err.message);
              } else {
                console.log(
                  '✅ Test user "admin" created if it did not exist.'
                );
              }
            }
          );
        }
      }
    );
    
    // Create traits table
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
        if (err) {
          console.error("❌ Traits table creation failed:", err.message);
        } else {
          console.log("✅ Traits table ready.");
        }
      }
    );
  }
});

// Serve landing page (index.html) with error handling
app.get("/", (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "view", "index.html"));
  } catch (error) {
    console.error("❌ Error serving index.html:", error.message);
    next(error);
  }
});

// Serve auth page (login/signup) with error handling
app.get("/auth.html", (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "view", "auth.html"));
  } catch (error) {
    console.error("❌ Error serving auth.html:", error.message);
    next(error);
  }
});

// Handle registration with enhanced error handling
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  // Input validation
  if (!username || !email || !password) {
    console.warn("⚠️ Registration attempt with missing fields");
    return res
      .status(400)
      .json({ error: "All username, email and password are required." });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.warn("⚠️ Invalid email format:", email);
    return res.status(400).json({ error: "Invalid email format." });
  }

  // Validate password length
  if (password.length < 6) {
    console.warn("⚠️ Password too short");
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long." });
  }

  const checkSql = `SELECT username FROM users WHERE username = ? OR email = ?`;
  db.get(checkSql, [username, email], (err, row) => {
    if (err) {
      console.error(
        "❌ Database error during registration check:",
        err.message
      );
      return res
        .status(500)
        .json({ error: "Database error. Please try again later." });
    }

    if (row) {
      console.warn("⚠️ Duplicate registration attempt:", username);
      return res
        .status(409)
        .json({
          error:
            "Username or email already exists. Please choose a different one.",
        });
    } else {
      const insertSql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
      db.run(insertSql, [username, email, password], function (err) {
        if (err) {
          console.error("❌ Registration failed:", err.message);
          return res
            .status(500)
            .json({ error: "Registration failed. Please try again." });
        }
        console.log("✅ New user registered:", username);
        res
          .status(201)
          .json({
            success: true,
            message: "Registration successful! You can now sign in.",
          });
      });
    }
  });
});

// Start server with error handling
const server = app
  .listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `❌ Port ${port} is already in use. Please use a different port or close the other application.`
      );
    } else {
      console.error("❌ Server error:", err.message);
    }
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM received, closing server...");
  server.close(() => {
    console.log("✅ Server closed");
    db.close((err) => {
      if (err) {
        console.error("❌ Error closing database:", err.message);
      } else {
        console.log("✅ Database connection closed");
      }
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("\n⚠️ SIGINT received, closing server...");
  server.close(() => {
    console.log("✅ Server closed");
    db.close((err) => {
      if (err) {
        console.error("❌ Error closing database:", err.message);
      } else {
        console.log("✅ Database connection closed");
      }
      process.exit(0);
    });
  });
});

// Handle login with enhanced error handling
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    console.warn("⚠️ Login attempt with missing credentials");
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.get(sql, [username, password], (err, row) => {
    if (err) {
      console.error("❌ Database error during login:", err.message);
      return res
        .status(500)
        .json({ error: "Database error. Please try again later." });
    }
    if (row) {
      // ✅ Save user info in session
      req.session.user = {
        id: row.id,
        username: row.username,
        loginTime: new Date().toISOString(),
      };
      // Mark this as a new login for welcome message
      req.session.showWelcome = true;

      // Save session before redirect
      req.session.save((err) => {
        if (err) {
          console.error("❌ Session save error:", err.message);
          return res
            .status(500)
            .json({ error: "Session error. Please try again." });
        }
        console.log("✅ User logged in:", username);
        res.redirect("/phaser.html"); // redirect to game after login
      });
    } else {
      console.warn("⚠️ Failed login attempt for:", username);
      res.status(401).json({ error: "Invalid username or password." });
    }
  });
});

// API endpoint to get current user info with error handling
app.get("/api/user", (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    // Check if we should show welcome message
    const showWelcome = req.session.showWelcome || false;

    // Clear the welcome flag after first fetch
    if (showWelcome) {
      req.session.showWelcome = false;
      req.session.save((err) => {
        if (err) {
          console.error("❌ Error saving session:", err.message);
        }
      });
    }

    res.json({
      user: req.session.user,
      showWelcome: showWelcome,
    });
  } catch (error) {
    console.error("❌ Error in /api/user:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// API endpoint to logout with error handling
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Logout error:", err.message);
      return res.status(500).json({ error: "Could not log out" });
    }
    console.log("✅ User logged out");
    res.json({ success: true });
  });
});

// API endpoint to save user traits
app.post("/api/traits/save", (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const { traits } = req.body;
    const userId = req.session.user.id;

    if (!traits) {
      return res.status(400).json({ error: "Traits data required" });
    }

    const sql = `
      INSERT INTO user_traits (user_id, empathy, responsibility, courage, fear, selfishness, dishonesty, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        empathy = excluded.empathy,
        responsibility = excluded.responsibility,
        courage = excluded.courage,
        fear = excluded.fear,
        selfishness = excluded.selfishness,
        dishonesty = excluded.dishonesty,
        updated_at = CURRENT_TIMESTAMP
    `;

    db.run(
      sql,
      [
        userId,
        traits.empathy || 0,
        traits.responsibility || 0,
        traits.courage || 0,
        traits.fear || 0,
        traits.selfishness || 0,
        traits.dishonesty || 0,
      ],
      (err) => {
        if (err) {
          console.error("❌ Error saving traits:", err.message);
          return res.status(500).json({ error: "Failed to save traits" });
        }
        console.log("✅ Traits saved for user:", req.session.user.username);
        res.json({ success: true });
      }
    );
  } catch (error) {
    console.error("❌ Error in /api/traits/save:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// API endpoint to get user traits
app.get("/api/traits/get", (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const userId = req.session.user.id;
    const sql = "SELECT * FROM user_traits WHERE user_id = ?";

    db.get(sql, [userId], (err, row) => {
      if (err) {
        console.error("❌ Error retrieving traits:", err.message);
        return res.status(500).json({ error: "Failed to retrieve traits" });
      }
      if (row) {
        res.json({ traits: row });
      } else {
        // Return default traits if none exist
        res.json({
          traits: {
            empathy: 0,
            responsibility: 0,
            courage: 0,
            fear: 0,
            selfishness: 0,
            dishonesty: 0,
          },
        });
      }
    });
  } catch (error) {
    console.error("❌ Error in /api/traits/get:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// API endpoint to get all users' traits (for dashboard)
app.get("/api/traits/all", (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const sql = `
      SELECT u.username, t.empathy, t.responsibility, t.courage, 
             t.fear, t.selfishness, t.dishonesty, t.updated_at
      FROM user_traits t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.updated_at DESC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("❌ Error retrieving all traits:", err.message);
        return res.status(500).json({ error: "Failed to retrieve traits" });
      }
      res.json({ users: rows || [] });
    });
  } catch (error) {
    console.error("❌ Error in /api/traits/all:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Serve phaser game page (protected route) with error handling
app.get("/phaser.html", (req, res, next) => {
  try {
    if (!req.session.user) {
      console.warn("⚠️ Unauthorized access attempt to phaser.html");
      return res.redirect("/auth.html"); // not logged in → go to auth page
    }
    res.sendFile(path.join(__dirname, "public/phaser.html")); // serve the game
  } catch (error) {
    console.error("❌ Error serving phaser.html:", error.message);
    next(error);
  }
});

// Serve dashboard page (protected route) with error handling
app.get("/dashboard.html", (req, res, next) => {
  try {
    if (!req.session.user) {
      console.warn("⚠️ Unauthorized access attempt to dashboard.html");
      return res.redirect("/auth.html");
    }
    res.sendFile(path.join(__dirname, "view/dashboard.html"));
  } catch (error) {
    console.error("❌ Error serving dashboard.html:", error.message);
    next(error);
  }
});

// 404 Error handler - must be after all routes
app.use((req, res) => {
  console.warn("⚠️ 404 Not Found:", req.url);
  res.status(404).json({ error: "Page not found" });
});

// Global error handler - must be last
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(err.status || 500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});
