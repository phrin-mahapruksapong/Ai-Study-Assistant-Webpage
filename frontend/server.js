const express = require("express");
const path = require("path");

const app = express();
const PORT = 3221;

// Serve static files
app.use(express.static(__dirname));

// Always return index.html for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend running at http://0.0.0.0:${PORT}`);
});

