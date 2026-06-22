"use strict";

console.log("STARTING...");

const express = require("express");
const app = express();

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("OK WORKS");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("LISTENING ON " + PORT);
});