"use strict";

const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// ⚠️ КРИТИЧНО ДЛЯ CLOUD RUN
const PORT = process.env.PORT || 8080;

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// =======================
// ШЛЯХ ДО ФРОНТЕНДУ
// =======================
const frontendDir = path.join(__dirname, "..");

// =======================
// СТАТИЧНІ ФАЙЛИ (ВАЖЛИВО)
// =======================
app.use(express.static(frontendDir));

// =======================
// ГОЛОВНА СТОРІНКА
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
// REGISTER API
// =======================
app.post("/api/register", (req, res) => {
    console.log("REGISTER:", req.body);

    const { username, password } = req.body;

    if (!username || username.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Ім’я мінімум 3 символи"
        });
    }

    if (!password || password.length < 4) {
        return res.status(400).json({
            success: false,
            message: "Пароль мінімум 4 символи"
        });
    }

    return res.json({
        success: true,
        message: "Реєстрація працює"
    });
});

// =======================
// LOGIN API
// =======================
app.post("/api/login", (req, res) => {
    return res.json({
        success: true,
        token: "test-token"
    });
});

// =======================
// START SERVER (КРИТИЧНО)
// =======================
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});