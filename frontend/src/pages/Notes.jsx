import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/notes";

const COLORS = ["#FFD37A", "#FF9466", "#B8A6FF", "#7FE0E8", "#D6E87A", "#FFB3C6", "#A8E6A1"];

function colorFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % COLORS.length;
  return COLORS[hash];
}

function formatDate(dateStr) {
  if (!dateStr) return "Not saved yet";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function Notes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState({});
  const [editing, setEditing] = useState({});
  const [openNoteId, setOpenNoteId] = useState(null);
  const [showTime, setShowTime] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // note pending delete confirmation

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
    setOpenNoteId(data.note._id);
    setEditing(prev => ({ ...prev, [data.note._id]: true }));
  };

  const updateLocal = (id, field, value) => {
    setNotes(notes.map(n => n._id === id ? { ...n, [field]: value } : n));
    setDirty(prev => ({ ...prev, [id]: true }));
  };

  const toggleEdit = (id) => setEditing(prev => ({ ...prev, [id]: !prev[id] }));

  const openForEdit = (id) => {
    setOpenNoteId(id);
    setEditing(prev => ({ ...prev, [id]: true }));
  };

  const saveNote = async (note) => {
    if (!dirty[note._id]) {
      setEditing(prev => ({ ...prev, [note._id]: false }));
      setOpenNoteId(null);
      return;
    }
    const { data } = await axios.put(`${API}/${note._id}/save`, {
      title: note.title, content: note.content,
    });
    setNotes(notes.map(n => n._id === note._id ? data.note : n));
    setDirty(prev => ({ ...prev, [note._id]: false }));
    setEditing(prev => ({ ...prev, [note._id]: false }));
    setOpenNoteId(null);
  };

  // Step 1: just opens the confirmation popup, doesn't delete yet
  const askDelete = (id) => setConfirmDeleteId(id);

  // Step 2: actually deletes, only called after user clicks "Delete" in the popup
  const confirmDelete = async () => {
    await axios.delete(`${API}/${confirmDeleteId}`);
    setNotes(notes.filter(n => n._id !== confirmDeleteId));
    setOpenNoteId(null);
    setConfirmDeleteId(null);
  };

  const cancelDelete = () => setConfirmDeleteId(null);

  const closePopup = () => setOpenNoteId(null);

  if (!user) return null;

  const openNote = notes.find(n => n._id === openNoteId);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "40px 30px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
          <div>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "30px", fontWeight: 800, color: "var(--ink)" }}>
              Notes
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "4px" }}>{user.username}'s workspace</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => navigate("/dashboard")} style={{
              padding: "12px 22px", borderRadius: "10px",
              border: "1.5px solid var(--border)", background: "#fff",
              color: "var(--ink)", fontSize: "13px", fontWeight: 700,
              fontFamily: "'Poppins', sans-serif", cursor: "pointer",
            }}>← Back</button>
            <button onClick={addNote} style={{
              padding: "12px 26px", borderRadius: "10px", border: "none",
              background: "var(--ink)", color: "#fff", fontSize: "13px", fontWeight: 700,
              fontFamily: "'Poppins', sans-serif", cursor: "pointer",
            }}>+ New Note</button>
          </div>
        </div>

        {loading && <p style={{ color: "var(--muted)" }}>Loading notes...</p>}

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "22px",
        }}>
          {notes.map(note => (
            <div key={note._id}
              style={{
                background: colorFor(note._id), borderRadius: "18px", padding: "22px",
                height: "230px", display: "flex", flexDirection: "column",
                justifyContent: "space-between", position: "relative",
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)", transition: "transform 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>

              <div style={{
                position: "absolute", top: "14px", right: "14px",
                display: "flex", gap: "6px", zIndex: 2,
              }}>
                <button onClick={() => setShowTime(showTime === note._id ? null : note._id)} title="Last edited time" style={{
                  background: "rgba(255,255,255,0.55)", border: "none", borderRadius: "7px",
                  width: "30px", height: "30px", cursor: "pointer", fontSize: "13px",
                }}>🕐</button>
                <button onClick={() => openForEdit(note._id)} title="Edit" style={{
                  background: "rgba(255,255,255,0.55)", border: "none", borderRadius: "7px",
                  width: "30px", height: "30px", cursor: "pointer", fontSize: "13px",
                }}>✏️</button>
                <button onClick={() => askDelete(note._id)} title="Delete" style={{
                  background: "rgba(255,255,255,0.55)", border: "none", borderRadius: "7px",
                  width: "30px", height: "30px", cursor: "pointer", fontSize: "13px",
                }}>🗑️</button>
              </div>

              {showTime === note._id && (
                <div style={{
                  position: "absolute", top: "50px", right: "14px",
                  background: "rgba(255,255,255,0.95)", borderRadius: "8px",
                  padding: "8px 12px", fontSize: "11px", color: "#333",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 3, width: "170px",
                }}>
                  <p>📅 Created: {formatDate(note.createdAt)}</p>
                  <p style={{ marginTop: "4px" }}>✏️ Last edited: {formatDate(note.lastSavedAt)}</p>
                </div>
              )}

              <div onClick={() => setOpenNoteId(note._id)} style={{ cursor: "pointer", overflow: "hidden", flex: 1, marginTop: "30px" }}>
                <h3 style={{
                  fontFamily: "'Poppins', sans-serif", fontSize: "17px", fontWeight: 700,
                  color: "#222", marginBottom: "10px",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {note.title || "Untitled"}
                </h3>
                <p style={{
                  fontSize: "13.5px", color: "#3a3a3a", lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                  display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {note.content || "Empty note..."}
                </p>
              </div>

              <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", fontWeight: 600 }}>
                {note.lastSavedAt ? "Saved" : "Draft"}
              </p>
            </div>
          ))}
        </div>

        {!loading && notes.length === 0 && (
          <p style={{ color: "var(--muted)", textAlign: "center", marginTop: "60px" }}>
            No notes yet. Click "+ New Note" to create one.
          </p>
        )}
      </div>

      {/* Note popup */}
      {openNote && (
        <div onClick={closePopup} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: editing[openNote._id] ? "640px" : "480px",
            maxWidth: "95%",
            maxHeight: "80vh",
            background: colorFor(openNote._id),
            borderRadius: "20px", padding: "30px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            display: "flex", flexDirection: "column",
            transition: "width 0.2s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <input
                value={openNote.title}
                onChange={e => updateLocal(openNote._id, "title", e.target.value)}
                readOnly={!editing[openNote._id]}
                placeholder="Title..."
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontFamily: "'Poppins', sans-serif", fontSize: "20px", fontWeight: 700,
                  color: "#222", cursor: editing[openNote._id] ? "text" : "default",
                }}
              />
              <button onClick={() => toggleEdit(openNote._id)} title="Edit" style={{
                background: editing[openNote._id] ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.5)",
                border: "none", borderRadius: "8px",
                width: "34px", height: "34px", cursor: "pointer", fontSize: "15px", flexShrink: 0,
              }}>✏️</button>
              <button onClick={closePopup} style={{
                background: "rgba(255,255,255,0.5)", border: "none", borderRadius: "8px",
                width: "34px", height: "34px", cursor: "pointer", fontSize: "15px", flexShrink: 0,
              }}>✕</button>
            </div>

            <textarea
              value={openNote.content}
              onChange={e => updateLocal(openNote._id, "content", e.target.value)}
              readOnly={!editing[openNote._id]}
              placeholder="Write your note..."
              style={{
                flex: 1, minHeight: editing[openNote._id] ? "280px" : "140px",
                background: "rgba(255,255,255,0.4)", border: "none", borderRadius: "12px",
                padding: "16px", fontSize: "14px", color: "#222", outline: "none",
                resize: "none", overflowY: "auto", fontFamily: "'Inter', sans-serif",
                cursor: editing[openNote._id] ? "text" : "default", lineHeight: "1.6",
                transition: "min-height 0.2s ease",
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              {editing[openNote._id] && (
                <button onClick={() => saveNote(openNote)} style={{
                  padding: "10px 22px", borderRadius: "10px", border: "none",
                  background: "#222", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer",
                }}>✓ Save</button>
              )}
              <button onClick={() => askDelete(openNote._id)} style={{
                padding: "10px 22px", borderRadius: "10px",
                border: "1.5px solid rgba(0,0,0,0.3)", background: "transparent",
                color: "#222", fontWeight: 700, fontSize: "13px", cursor: "pointer",
              }}>✕ Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation popup */}
      {confirmDeleteId && (
        <div onClick={cancelDelete} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1100, padding: "20px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: "320px", background: "#fff", borderRadius: "16px",
            padding: "28px 24px", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <p style={{
              fontFamily: "'Poppins', sans-serif", fontSize: "17px", fontWeight: 700,
              color: "#222", marginBottom: "20px",
            }}>Delete this note?</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={cancelDelete} style={{
                flex: 1, padding: "12px", borderRadius: "10px",
                border: "1.5px solid var(--border)", background: "#fff",
                color: "var(--ink)", fontWeight: 700, fontSize: "13px", cursor: "pointer",
              }}>Cancel</button>
              <button onClick={confirmDelete} style={{
                flex: 1, padding: "12px", borderRadius: "10px", border: "none",
                background: "#e8505b", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer",
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
