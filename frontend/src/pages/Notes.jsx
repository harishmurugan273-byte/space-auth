import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/notes";

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function Notes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState({});
  // tracks which notes are currently unlocked for editing
  const [editing, setEditing] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/");
    const u = JSON.parse(stored);
    setUser(u);
    fetchNotes(u._id);
  }, [navigate]);

  const fetchNotes = async (userId) => {
    setLoading(true);
    const { data } = await axios.get(`${API}/${userId}`);
    setNotes(data.notes);
    setLoading(false);
  };

  const addNote = async () => {
    const { data } = await axios.post(API, { userId: user._id, title: "", content: "" });
    setNotes([data.note, ...notes]);
    // new note opens directly in edit mode
    setEditing(prev => ({ ...prev, [data.note._id]: true }));
  };

  const updateLocal = (id, field, value) => {
    setNotes(notes.map(n => n._id === id ? { ...n, [field]: value } : n));
    setDirty(prev => ({ ...prev, [id]: true }));
  };

  const toggleEdit = (id) => {
    setEditing(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const saveNote = async (note) => {
    if (!dirty[note._id]) {
      // nothing changed, just lock it back
      setEditing(prev => ({ ...prev, [note._id]: false }));
      return;
    }

    const { data } = await axios.put(`${API}/${note._id}/save`, {
      title: note.title, content: note.content,
    });
    setNotes(notes.map(n => n._id === note._id ? data.note : n));
    setDirty(prev => ({ ...prev, [note._id]: false }));
    setEditing(prev => ({ ...prev, [note._id]: false })); // lock again after saving
  };

  const deleteNote = async (id) => {
    await axios.delete(`${API}/${id}`);
    setNotes(notes.filter(n => n._id !== id));
  };

  if (!user) return null;

  return (
    <div style={{
      minHeight: "100vh", padding: "50px 20px",
      background: "radial-gradient(ellipse at 50% 0%, #003d3a 0%, #001a18 40%, #020c10 100%)",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: "26px", fontWeight: 900,
            color: "transparent", backgroundClip: "text", WebkitBackgroundClip: "text",
            backgroundImage: "linear-gradient(135deg, #ffffff 0%, var(--teal) 100%)",
            letterSpacing: "0.1em",
          }}>MY NOTES</h1>
          <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "6px" }}>{user.username}'s workspace</p>
        </div>

        <button onClick={addNote} style={{
          display: "block", margin: "0 auto 30px", padding: "14px 32px",
          borderRadius: "12px", border: "none",
          background: "linear-gradient(135deg, var(--teal) 0%, #007a74 100%)",
          color: "#001a18", fontSize: "14px", fontWeight: 700,
          fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em", cursor: "pointer",
        }}>
          + NEW NOTE
        </button>

        {loading && <p style={{ color: "var(--muted)", textAlign: "center" }}>Loading notes...</p>}

        <div style={{ display: "grid", gap: "20px" }}>
          {notes.map(note => {
            const hasUnsavedChanges = !!dirty[note._id];
            const isEditing = !!editing[note._id];
            const savedTime = formatDate(note.lastSavedAt);

            return (
              <div key={note._id} style={{
                background: "rgba(0,40,36,0.45)", backdropFilter: "blur(20px)",
                border: isEditing ? "1px solid var(--teal)" : "1px solid var(--glass-border)",
                borderRadius: "16px", padding: "24px", transition: "border 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <input
                    placeholder="Note title..."
                    value={note.title}
                    onChange={e => updateLocal(note._id, "title", e.target.value)}
                    readOnly={!isEditing}
                    style={{
                      flex: 1, background: "transparent", border: "none",
                      color: "#fff", fontSize: "18px", fontWeight: 700,
                      outline: "none", fontFamily: "'Inter', sans-serif",
                      cursor: isEditing ? "text" : "default",
                    }}
                  />
                  <button
                    onClick={() => toggleEdit(note._id)}
                    title={isEditing ? "Stop editing" : "Edit this note"}
                    style={{
                      background: isEditing ? "rgba(0,212,200,0.15)" : "transparent",
                      border: "1px solid rgba(0,212,200,0.3)", borderRadius: "8px",
                      width: "34px", height: "34px", cursor: "pointer",
                      fontSize: "15px", flexShrink: 0,
                    }}>
                    ✏️
                  </button>
                </div>

                <textarea
                  placeholder="Write your note here..."
                  value={note.content}
                  onChange={e => updateLocal(note._id, "content", e.target.value)}
                  readOnly={!isEditing}
                  rows={4}
                  style={{
                    width: "100%",
                    background: isEditing ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)",
                    border: "1px solid rgba(0,212,200,0.15)", borderRadius: "10px",
                    color: isEditing ? "var(--text)" : "var(--muted)",
                    fontSize: "14px", padding: "12px",
                    outline: "none", resize: "vertical", fontFamily: "'Inter', sans-serif",
                    cursor: isEditing ? "text" : "default",
                  }}
                />

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginTop: "14px", flexWrap: "wrap", gap: "8px",
                }}>
                  <p style={{
                    color: hasUnsavedChanges ? "#ffb84d" : "var(--muted)",
                    fontSize: "11.5px",
                  }}>
                    {hasUnsavedChanges
                      ? "✏️ Edited — not saved yet"
                      : savedTime
                        ? `✏️ Last edited ${savedTime}`
                        : "Not saved yet"}
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {isEditing && (
                      <button onClick={() => saveNote(note)} style={{
                        padding: "8px 18px", borderRadius: "8px", border: "none",
                        background: "var(--teal)", color: "#001a18",
                        fontWeight: 700, fontSize: "13px", cursor: "pointer",
                      }}>
                        ✓ Save
                      </button>
                    )}
                    <button onClick={() => deleteNote(note._id)} style={{
                      padding: "8px 18px", borderRadius: "8px",
                      border: "1px solid var(--error)", background: "transparent",
                      color: "var(--error)", fontWeight: 700, fontSize: "13px", cursor: "pointer",
                    }}>
                      ✕ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && notes.length === 0 && (
          <p style={{ color: "var(--muted)", textAlign: "center", marginTop: "30px" }}>
            No notes yet. Click "+ NEW NOTE" to create one.
          </p>
        )}

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button onClick={() => navigate("/dashboard")} style={{
            padding: "12px 28px", borderRadius: "12px",
            border: "1px solid rgba(0,212,200,0.3)", background: "transparent",
            color: "var(--teal)", fontSize: "13px", fontWeight: 700,
            fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em", cursor: "pointer",
          }}>
            ← BACK
          </button>
        </div>
      </div>
    </div>
  );
}
