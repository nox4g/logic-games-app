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

app.use("/assets", express.static(path.join(frontendDir, "assets")));
app.use("/css", express.static(path.join(frontendDir, "css")));
app.use("/js", express.static(path.join(frontendDir, "js")));
app.use("/pages", express.static(path.join(frontendDir, "pages")));

app.get("/", function(req, res) {
    res.sendFile(path.join(frontendDir, "index.html"));
});

app.get("/index.html", function(req, res) {
    res.sendFile(path.join(frontendDir, "index.html"));
});

const db = new sqlite3.Database(path.join(__dirname, "database.db"));

db.serialize(function() {
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
    if (!token) {
        callback(null, null);
        return;
    }

    db.get(
        `
        SELECT users.id, users.username
        FROM sessions
        INNER JOIN users ON users.id = sessions.user_id
        WHERE sessions.token = ?
        `,
        [token],
        function(error, user) {
            if (error || !user) {
                callback(error, null);
                return;
            }

            callback(null, user);
        }
    );
}

app.post("/api/register", function(req, res) {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "").trim();

    if (username.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Ім’я користувача має містити мінімум 3 символи."
        });
    }

    if (password.length < 4) {
        return res.status(400).json({
            success: false,
            message: "Пароль має містити мінімум 4 символи."
        });
    }

    const passwordHash = hashPassword(password);

    db.run(
        `
        INSERT INTO users (username, password_hash, created_at)
        VALUES (?, ?, ?)
        `,
        [username, passwordHash, getCurrentDate()],
        function(error) {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: "Користувач з таким іменем уже існує."
                });
            }

            res.json({
                success: true,
                message: "Користувача створено."
            });
        }
    );
});

app.post("/api/login", function(req, res) {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "").trim();

    const passwordHash = hashPassword(password);

    db.get(
        `
        SELECT id, username
        FROM users
        WHERE username = ? AND password_hash = ?
        `,
        [username, passwordHash],
        function(error, user) {
            if (error || !user) {
                return res.status(401).json({
                    success: false,
                    message: "Неправильний логін або пароль."
                });
            }

            const token = createToken();

            db.run(
                `
                INSERT INTO sessions (token, user_id, created_at)
                VALUES (?, ?, ?)
                `,
                [token, user.id, getCurrentDate()],
                function(sessionError) {
                    if (sessionError) {
                        return res.status(500).json({
                            success: false,
                            message: "Помилка створення сесії."
                        });
                    }

                    res.json({
                        success: true,
                        token: token,
                        user: {
                            id: user.id,
                            username: user.username
                        }
                    });
                }
            );
        }
    );
});

app.post("/api/logout", function(req, res) {
    const token = req.body.token;

    if (!token) {
        return res.json({
            success: true
        });
    }

    db.run(
        `
        DELETE FROM sessions
        WHERE token = ?
        `,
        [token],
        function() {
            res.json({
                success: true
            });
        }
    );
});

app.post("/api/results", function(req, res) {
    const token = req.body.token;

    getUserByToken(token, function(error, user) {
        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: "Користувач не авторизований."
            });
        }

        const game = String(req.body.game || "").trim();
        const result = String(req.body.result || "").trim();
        const score = Number(req.body.score || 0);
        const details = JSON.stringify(req.body.details || {});

        if (!game || !result) {
            return res.status(400).json({
                success: false,
                message: "Не вказано гру або результат."
            });
        }

        db.run(
            `
            INSERT INTO results (user_id, game, result, score, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [user.id, game, result, score, details, getCurrentDate()],
            function(insertError) {
                if (insertError) {
                    return res.status(500).json({
                        success: false,
                        message: "Помилка збереження результату."
                    });
                }

                res.json({
                    success: true,
                    message: "Результат збережено."
                });
            }
        );
    });
});

app.post("/api/stats", function(req, res) {
    const token = req.body.token;

    getUserByToken(token, function(error, user) {
        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: "Користувач не авторизований."
            });
        }

        db.all(
            `
            SELECT game, result, score, details, created_at
            FROM results
            WHERE user_id = ?
            ORDER BY created_at DESC
            `,
            [user.id],
            function(selectError, rows) {
                if (selectError) {
                    return res.status(500).json({
                        success: false,
                        message: "Помилка отримання статистики."
                    });
                }

                const stats = {};

                rows.forEach(function(row) {
                    if (!stats[row.game]) {
                        stats[row.game] = {
                            played: 0,
                            wins: 0,
                            losses: 0,
                            bestScore: 0,
                            results: []
                        };
                    }

                    stats[row.game].played++;

                    if (row.result === "win") {
                        stats[row.game].wins++;
                    }

                    if (row.result === "lose") {
                        stats[row.game].losses++;
                    }

                    if (row.score > stats[row.game].bestScore) {
                        stats[row.game].bestScore = row.score;
                    }

                    stats[row.game].results.push(row);
                });

                res.json({
                    success: true,
                    stats: stats,
                    results: rows
                });
            }
        );
    });
});

app.listen(PORT, () => {
    console.log("Server started on port " + PORT);
});