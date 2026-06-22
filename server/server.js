"use strict";

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: "50kb" }));

const frontendDir = path.join(__dirname, "..");

// static
app.use("/assets", express.static(path.join(frontendDir, "assets")));
app.use("/css", express.static(path.join(frontendDir, "css")));
app.use("/js", express.static(path.join(frontendDir, "js")));
app.use("/pages", express.static(path.join(frontendDir, "pages")));

// pages
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

// DB
const db = new sqlite3.Database(path.join(__dirname, "database.db"));

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            game TEXT NOT NULL,
            result TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            details TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
});

// helpers
function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

function createToken() {
    return crypto.randomBytes(32).toString("hex");
}

function getCurrentDate() {
    return new Date().toISOString();
}

function getUserByToken(token, callback) {
    if (!token) return callback(null, null);

    db.get(
        `
        SELECT users.id, users.username
        FROM sessions
        INNER JOIN users ON users.id = sessions.user_id
        WHERE sessions.token = ?
        `,
        [token],
        (error, user) => {
            if (error || !user) return callback(error, null);
            callback(null, user);
        }
    );
}

/* ---------------- API ---------------- */

app.post("/api/register", (req, res) => {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "").trim();

    if (username.length < 3) {
        return res.status(400).json({ success: false, message: "Ім’я має бути 3+ символи" });
    }

    if (password.length < 4) {
        return res.status(400).json({ success: false, message: "Пароль 4+ символи" });
    }

    const passwordHash = hashPassword(password);

    db.run(
        `INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)`,
        [username, passwordHash, getCurrentDate()],
        (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: "Користувач вже існує"
                });
            }

            res.json({ success: true });
        }
    );
});

app.post("/api/login", (req, res) => {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "").trim();

    const passwordHash = hashPassword(password);

    db.get(
        `SELECT id, username FROM users WHERE username = ? AND password_hash = ?`,
        [username, passwordHash],
        (err, user) => {
            if (err || !user) {
                return res.status(401).json({
                    success: false,
                    message: "Невірні дані"
                });
            }

            const token = createToken();

            db.run(
                `INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)`,
                [token, user.id, getCurrentDate()],
                (sessionErr) => {
                    if (sessionErr) {
                        return res.status(500).json({
                            success: false,
                            message: "Помилка сесії"
                        });
                    }

                    res.json({
                        success: true,
                        token,
                        user
                    });
                }
            );
        }
    );
});

app.post("/api/logout", (req, res) => {
    const token = req.body.token;

    db.run(`DELETE FROM sessions WHERE token = ?`, [token], () => {
        res.json({ success: true });
    });
});

app.post("/api/results", (req, res) => {
    getUserByToken(req.body.token, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ success: false });
        }

        const game = req.body.game;
        const result = req.body.result;
        const score = Number(req.body.score || 0);

        db.run(
            `INSERT INTO results (user_id, game, result, score, details, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                user.id,
                game,
                result,
                score,
                JSON.stringify(req.body.details || {}),
                getCurrentDate()
            ],
            () => {
                res.json({ success: true });
            }
        );
    });
});

app.post("/api/stats", (req, res) => {
    getUserByToken(req.body.token, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ success: false });
        }

        db.all(
            `SELECT * FROM results WHERE user_id = ? ORDER BY created_at DESC`,
            [user.id],
            (err, rows) => {
                if (err) return res.status(500).json({ success: false });

                res.json({ success: true, results: rows });
            }
        );
    });
});


app.listen(PORT, "0.0.0.0", () => {
    console.log("Server started on port " + PORT);
});