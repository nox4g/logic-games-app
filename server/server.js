"use strict";

const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 8080;

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// =======================
// FRONTEND
// =======================
const frontendDir = path.join(__dirname, "..");

app.use(express.static(frontendDir));

// =======================
// HOME
// =======================
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

// =======================
// HEALTH CHECK (Cloud Run)
// =======================
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

// =======================
// REGISTER (ТВОЯ КНОПКА)
// =======================
app.post("/api/register", (req, res) => {
    console.log("REGISTER HIT:", req.body);

        const username = req.body.username;
        const password = req.body.password;

        res.json({ success: true });
    });
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "").trim();

    if (username.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Ім’я має бути мінімум 3 символи"
        });
    }

    if (password.length < 4) {
        return res.status(400).json({
            success: false,
            message: "Пароль має бути мінімум 4 символи"
        });
    }

    // тестова відповідь (без БД)
    res.json({
        success: true,
        message: "Реєстрація працює (сервер OK)"
    });
});

// =======================
// LOGIN (тест)
// =======================
app.post("/api/login", (req, res) => {
    res.json({
        success: true,
        token: "test-token"
    });
});

// =======================
// START SERVER (КРИТИЧНО)
// =======================
app.listen(PORT, "0.0.0.0", () => {
    console.log("Server started on port " + PORT);
});