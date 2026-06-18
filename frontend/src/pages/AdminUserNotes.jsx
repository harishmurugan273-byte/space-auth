import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const NOTES_API = "http://localhost:5000/api/notes";

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function AdminUserNotes() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/");
    const admin = JSON.parse(stored);
    if (!admin.isAdmin) return navigate("/dashboard");

    axios.get(`${NOTES_API}/${userId}`)
      .then(({ data }) => setNotes(data.notes))
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  return (
    <div style={{
      minHeight: "100vh", padding: "50px 20px",
      background: "radial-gradient(ellipse at 50% 0%, #003d3a 0%, #001a18 40%, #020c10 100%)",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: "24px", fontWeight: 900,
          color: "#fff", textAlign: "center", marginBottom: "30px", letterSpacing: "0.08em",
        }}>USER'S NOTES (ADMIN VIEW)</h1>

        {loading && <p style={{ color: "var(--muted)", textAlign: "center" }}>Loading...</p>}

        <div style={{ display: "grid", gap: "20px" }}>
          {notes.map(note => {
            const savedTime = formatDate(note.lastSavedAt);
            return (
              <div key={note._id} style={{
                background: "rgba(0,40,36,0.45)", backdropFilter: "blur(20px)",
                border: "1px solid var(--glass-border)", borderRadius: "16px", padding: "24px",
              }}>
                <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "10px" }}>
                  {note.title || "(Untitled)"}
                </h3>
                <p style={{ color: "var(--text)", fontSize: "14px", whiteSpace: "pre-wrap", marginBottom: "14px" }}>
                  {note.content || "(Empty note)"}
                </p>
                <p style={{ color: "var(--muted)", fontSize: "11.5px" }}>
                  {savedTime ? `✏️ Last edited ${savedTime}` : "Not saved yet"}
                </p>
              </div>
            );
          })}
        </div>

        {!loading && notes.length === 0 && (
          <p style={{ color: "var(--muted)", textAlign: "center" }}>This user has no notes yet.</p>
        )}

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button onClick={() => navigate("/users")} style={{
            padding: "12px 28px", borderRadius: "12px",
            border: "1px solid rgba(0,212,200,0.3)", background: "transparent",
            color: "var(--teal)", fontSize: "13px", fontWeight: 700,
            fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em", cursor: "pointer",
          }}>
            ← BACK TO USERS LIST
          </button>
        </div>
      </div>
    </div>
  );
}
