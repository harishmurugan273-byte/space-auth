import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const NOTES_API = "http://localhost:5000/api/notes";
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

export default function AdminUserNotes() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNoteId, setOpenNoteId] = useState(null);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/");
    const admin = JSON.parse(stored);
    if (!admin.isAdmin) return navigate("/dashboard");

    axios.get(`${NOTES_API}/${userId}`)
      .then(({ data }) => setNotes(data.notes))
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  const openNote = notes.find(n => n._id === openNoteId);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "40px 30px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "26px", fontWeight: 800, color: "var(--ink)" }}>
            User's Notes (Admin View)
          </h1>
          <button onClick={() => navigate("/users")} style={{
            padding: "12px 22px", borderRadius: "10px",
            border: "1.5px solid var(--border)", background: "#fff",
            color: "var(--ink)", fontSize: "13px", fontWeight: 700,
            fontFamily: "'Poppins', sans-serif", cursor: "pointer",
          }}>← Back to Users</button>
        </div>

        {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {notes.map(note => (
            <div key={note._id}
              onClick={() => setOpenNoteId(note._id)}
              style={{
                background: colorFor(note._id), borderRadius: "16px", padding: "20px",
                height: "170px", cursor: "pointer", display: "flex", flexDirection: "column",
                justifyContent: "space-between", boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              }}>
              <div style={{ overflow: "hidden" }}>
                <h3 style={{
                  fontFamily: "'Poppins', sans-serif", fontSize: "15px", fontWeight: 700,
                  color: "#222", marginBottom: "8px",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {note.title || "Untitled"}
                </h3>
                <p style={{
                  fontSize: "13px", color: "#3a3a3a", lineHeight: "1.4",
                  display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
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
          <p style={{ color: "var(--muted)", textAlign: "center", marginTop: "60px" }}>This user has no notes yet.</p>
        )}
      </div>

      {openNote && (
        <div onClick={() => { setOpenNoteId(null); setShowTime(false); }} style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: "480px", maxWidth: "95%", maxHeight: "80vh",
            background: colorFor(openNote._id), borderRadius: "20px", padding: "30px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <h3 style={{
                flex: 1, fontFamily: "'Poppins', sans-serif", fontSize: "20px", fontWeight: 700, color: "#222",
              }}>{openNote.title || "Untitled"}</h3>
              <button onClick={() => setShowTime(!showTime)} title="View timestamps" style={{
                background: "rgba(255,255,255,0.5)", border: "none", borderRadius: "8px",
                width: "34px", height: "34px", cursor: "pointer", fontSize: "15px", flexShrink: 0,
              }}>🕐</button>
              <button onClick={() => { setOpenNoteId(null); setShowTime(false); }} style={{
                background: "rgba(255,255,255,0.5)", border: "none", borderRadius: "8px",
                width: "34px", height: "34px", cursor: "pointer", fontSize: "15px", flexShrink: 0,
              }}>✕</button>
            </div>

            {showTime && (
              <div style={{
                background: "rgba(255,255,255,0.6)", borderRadius: "10px",
                padding: "10px 14px", marginBottom: "14px", fontSize: "12px", color: "#333",
              }}>
                <p>📅 Created: {formatDate(openNote.createdAt)}</p>
                <p style={{ marginTop: "4px" }}>✏️ Last edited: {formatDate(openNote.lastSavedAt)}</p>
              </div>
            )}

            <div style={{
              flex: 1, minHeight: "140px", background: "rgba(255,255,255,0.4)",
              borderRadius: "12px", padding: "16px", fontSize: "14px", color: "#222",
              overflowY: "auto", whiteSpace: "pre-wrap", lineHeight: "1.6",
            }}>
              {openNote.content || "(Empty note)"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
