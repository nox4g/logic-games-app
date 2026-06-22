"use strict";

const express = require("express");
const path = require("path");

const app = express();

// MUST for Cloud Run
const PORT = process.env.PORT || 8080;

app.use(express.json());

// =======================
// PATHS
// =======================

// server.js лежить в /server
// фронт лежить на рівень вище
const frontendDir = path.join(__dirname, "..");

// =======================
// STATIC FILES (ДУЖЕ ВАЖЛИВО)
// =======================

// дозволяє відкривати /css, /js, /assets і т.д.
app.use(express.static(frontendDir));

// =======================
// HOME PAGE
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

    const username = (req.body.username || "").trim();
    const password = (req.body.password || "").trim();

    if (username.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Ім'я мінімум 3 символи"
        });
    }

    if (password.length < 4) {
        return res.status(400).json({
            success: false,
            message: "Пароль мінімум 4 символи"
        });
    }

    return res.json({
        success: true,
        message: "Реєстрація OK"
    });
});

// =======================
// LOGIN API
// =======================

app.post("/api/login", (req, res) => {
    console.log("LOGIN:", req.body);

    const username = (req.body.username || "").trim();

    if (!username) {
        return res.status(400).json({
            success: false,
            message: "Username required"
        });
    }

    return res.json({
        success: true,
        token: "demo-token",
        user: {
            username: username
        }
    });
});

// =======================
// START SERVER
// =======================

app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port", PORT);
});