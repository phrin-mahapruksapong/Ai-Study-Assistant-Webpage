document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "http://54.80.177.133:3222/notes"; 
  const aiUrl = "http://54.80.177.133:3222/ask-ai";

  const noteTitleInput = document.getElementById("note-title");
  const noteContentInput = document.getElementById("note-content");
  const addNoteBtn = document.getElementById("add-note-btn");
  const noteList = document.getElementById("note-list");
  const aiResponseDiv = document.getElementById("ai-response");

  // Load notes
  async function loadNotes() {
    const res = await fetch(apiUrl);
    const notes = await res.json();
    noteList.innerHTML = "";

    notes.forEach((note) => {
      const div = document.createElement("div");
      div.className = "note";

      const titleEl = document.createElement("h3");
      titleEl.textContent = note.title;

      const contentEl = document.createElement("p");
      contentEl.textContent = note.content;

      const btnContainer = document.createElement("div");
      btnContainer.className = "note-buttons";

      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => editNotePrompt(note));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteNote(note.id));

      const aiBtn = document.createElement("button");
      aiBtn.className = "ai-btn";
      aiBtn.textContent = "Ask AI";
      aiBtn.addEventListener("click", () => askAI(note.content));

      btnContainer.appendChild(editBtn);
      btnContainer.appendChild(deleteBtn);
      btnContainer.appendChild(aiBtn);

      div.appendChild(titleEl);
      div.appendChild(contentEl);
      div.appendChild(btnContainer);

      noteList.appendChild(div);
    });
  }

  // Add note
  addNoteBtn.addEventListener("click", async () => {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    if (!title || !content) return alert("Please enter title and content");

    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    noteTitleInput.value = "";
    noteContentInput.value = "";
    loadNotes();
  });

  // Edit note
  async function editNotePrompt(note) {
    const title = prompt("Edit title:", note.title);
    const content = prompt("Edit content:", note.content);
    if (!title || !content) return;

    await fetch(`${apiUrl}/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    loadNotes();
  }

  // Delete note
  async function deleteNote(id) {
    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    loadNotes();
  }

  // Ask AI
  async function askAI(content) {
    aiResponseDiv.textContent = "⏳ Generating summary...";
    try {
      const res = await fetch(aiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      aiResponseDiv.innerHTML = `<b>AI:</b> ${data.answer}`;
    } catch (err) {
      aiResponseDiv.innerHTML = `<b>Error:</b> ${err.message}`;
      console.error(err);
    }
  }

  // Initial load
  loadNotes();
});
