const express = require("express");
const app = express();

const PORT = 4000;

app.get("/", (req, res) => {
  res.send("CloudOps Node.js Backend Running");
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "running",
    project: "CloudOps Enterprise Platform",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
