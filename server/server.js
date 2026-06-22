"use strict";

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

console.log("BOOT START");

// JSON
app.use(express.json());

// FRONTEND
const frontendDir = path.resolve(__dirname, "..");

console.log("frontendDir =", frontendDir);

// STATIC FILES
app.use(express.static(frontendDir));

// HOME
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

// HEALTH
app.get("/health", (req, res) => {
    res.send("OK");
});

// LOGIN (ВАЖЛИВО)
app.post("/api/login", (req, res) => {
    console.log("LOGIN HIT", req.body);

    return res.json({
        success: true,
        token: "ok"
    });
});

// REGISTER
app.post("/api/register", (req, res) => {
    console.log("REGISTER HIT", req.body);

    return res.json({
        success: true,
        message: "OK"
    });
});

// START
app.listen(PORT, "0.0.0.0", () => {
    console.log("SERVER RUNNING ON", PORT);
});