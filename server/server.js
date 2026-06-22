const express = require("express");

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("OK Cloud Run");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("Running on " + PORT);
});