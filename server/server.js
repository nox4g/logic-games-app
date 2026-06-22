"use strict";

const express = require("express");
const path = require("path");

const app = express();

// КРИТИЧНО для Cloud Run
const PORT = process.env.PORT || 8080;

// щоб JSON працював
app.use(express.json());

// =======================
// 📁 ФРОНТЕНД (ВАЖЛИВО)
// =======================

// якщо index.html в корені проєкту (разом із server/)
const frontendDir = path.join(__dirname, "..");

// статичні файли
app.use(express.static(frontendDir));

// =======================
// 🏠 ГОЛОВНА СТОРІНКА
// =======================
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

// =======================
// HEALTH CHECK (ДУЖЕ ВАЖЛИВО)
// =======================
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

// =======================
// 🚀 ЗАПУСК (КРИТИЧНО)
// =======================
app.listen(PORT, "0.0.0.0", () => {
    console.log("Server started on port " + PORT);
});