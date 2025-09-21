import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(session({
  secret: 'mysecretkey',   // any random string
  resave: false,
  saveUninitialized: true
}));
const port = 3000;
app.use(express.static(__dirname));

// Middleware to handle form and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database connection
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the users.db database.');

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
             email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error(err.message);
            } else {
               db.run(`INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)`, 
       ['admin', 'admin@example.com', 'password123'],

                       (err) => {
                    if (err) console.error(err.message);
                    console.log('Test user "admin" created if it did not exist.');
                    });
                }
            });
        }
    });

app.get('/', (req, res) => {
    res.send('Welcome! Go to <a href="/auth.html">go to hell</a>');
});

// Serve signup page
app.get('/auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'view' ,'auth.html'));
});

// Handle registration
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username ||!email || !password) {
        return res.status(400).send('All username,email and password are required.');
    }

    const checkSql = `SELECT username FROM users WHERE username = ? OR email = ?`;
    db.get(checkSql, [username,email], (err, row) => {
        if (err) {
            return res.status(500).send('Database error.');
        }

        if (row) {
            res.status(409).send('Username already exists. Please choose a different one.');
        } else {
            const insertSql = `INSERT INTO users (username,email, password) VALUES (?,?,?)`;
            db.run(insertSql, [username,email, password], function(err) {
                if (err) {
                    return res.status(500).send('Registration failed. Please try again.');
                }
                res.status(201).send('Registration successful! You can now sign in.');
            });
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.get(sql, [username, password], (err, row) => {
        if (err) {
            return res.status(500).send('Database error.');
        }
        if (row) {
            // ✅ Save user info in session
            req.session.user = { id: row.id, username: row.username };
            res.redirect('/GameScene'); // redirect to scene page after login
        } else {
            res.status(401).send('Invalid username or password.');
        }
    });
});

app.get('/GameScene', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth.html'); // not logged in → go to auth page
    }

    res.sendFile(path.join(__dirname, 'view/game.html')); // your actual scene page
});
app.use(express.static(path.join(__dirname)));
