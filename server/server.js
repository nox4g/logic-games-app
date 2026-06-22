"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// 📁 корінь фронта = весь проєкт
const frontendDir = path.join(__dirname, "..");

// 📦 статичні файли
app.use("/assets", express.static(path.join(frontendDir, "assets")));
app.use("/css", express.static(path.join(frontendDir, "css")));
app.use("/js", express.static(path.join(frontendDir, "js")));
app.use("/pages", express.static(path.join(frontendDir, "pages")));

// 🏠 головна сторінка
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

// 🔥 тест здоров’я (дуже важливо для Cloud Run)
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

// 🚀 старт сервера (КРИТИЧНО)
app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
});