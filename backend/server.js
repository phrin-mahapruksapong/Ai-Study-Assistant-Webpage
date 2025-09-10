const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
require("dotenv").config();
console.log("Loaded OpenAI key:", process.env.OPENAI_API_KEY ? "YES" : "NO");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to SQLite
const db = new sqlite3.Database("./notes.db");

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  content TEXT
)`);

// --- CRUD Endpoints ---

// CREATE
app.post("/notes", (req, res) => {
  const { title, content } = req.body;
  db.run(
    "INSERT INTO notes(title, content) VALUES(?, ?)",
    [title, content],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({ id: this.lastID, title, content });
    }
  );
});

// READ
app.get("/notes", (req, res) => {
  db.all("SELECT * FROM notes", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// UPDATE
app.put("/notes/:id", (req, res) => {
  const { title, content } = req.body;
  const { id } = req.params;
  db.run(
    "UPDATE notes SET title=?, content=? WHERE id=?",
    [title, content, id],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({ updatedID: id });
    }
  );
});

// DELETE
app.delete("/notes/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM notes WHERE id=?", [id], function (err) {
    if (err) return res.status(500).send(err.message);
    res.json({ deletedID: id });
  });
});

// --- AI Endpoint ---
app.post("/ask-ai", async (req, res) => {
  const { content } = req.body;
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing in .env");
    }

    // ใช้ fetch แทน axios
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Summarize this note: ${content}` }],
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(JSON.stringify(errData));
    }

    const data = await response.json();
    res.json({ answer: data.choices[0].message.content });

  } catch (e) {
    console.error("AI request failed:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// Start server
const PORT = 3222;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${PORT}`));
