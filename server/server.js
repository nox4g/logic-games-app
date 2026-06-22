"use strict";

const express = require("express");
const path = require("path");

const app = express();

// Cloud Run port
const PORT = process.env.PORT || 8080;

// =======================
// SAFETY LOG (ДУЖЕ ВАЖЛИВО)
// =======================
console.log("SERVER STARTING...");

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());

// =======================
// FRONTEND PATH (SAFE)
// =======================
const frontendDir = path.resolve(__dirname, "..");

console.log("Frontend dir:", frontendDir);

// =======================
// STATIC FILES
// =======================
app.use(express.static(frontendDir));

// =======================
// ROOT
// =======================
app.get("/", (req, res) => {
    const file = path.join(frontendDir, "index.html");
    console.log("Sending:", file);
    res.sendFile(file);
});

// =======================
// HEALTH CHECK
// =======================
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

// =======================
// TEST API (щоб перевірити чи сервер живий)
// =======================
app.get("/api/test", (req, res) => {
    res.json({ ok: true });
});

// =======================
// START SERVER (КРИТИЧНО)
// =======================
app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port:", PORT);
});