"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "..", "..")));

console.log("FRONTEND DIR:", frontendDir);

app.use(cors());
app.use(express.json());
app.use(express.static(frontendDir));

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

app.get("/health", (req, res) => {
    res.send("OK");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on " + PORT);
});