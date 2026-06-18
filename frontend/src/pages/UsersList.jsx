import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/auth";

export default function UsersList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/");
    const admin = JSON.parse(stored);
    if (!admin.isAdmin) return navigate("/dashboard");

    axios.get(API + "/users")
      .then(({ data }) => setUsers(data.users))
      .catch(() => setError("Failed to load users from database"))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh", padding: "50px 20px",
      background: "radial-gradient(ellipse at 50% 0%, #003d3a 0%, #001a18 40%, #020c10 100%)",
      position: "relative",
    }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: "26px", fontWeight: 900,
            color: "transparent", backgroundClip: "text", WebkitBackgroundClip: "text",
            backgroundImage: "linear-gradient(135deg, #ffffff 0%, var(--teal) 100%)",
            letterSpacing: "0.1em",
          }}>ALL USERS</h1>
          <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "10px" }}>
            Click any user to view their notes
          </p>
        </div>

        <div style={{
          background: "rgba(0,40,36,0.45)", backdropFilter: "blur(24px)",
          border: "1px solid var(--glass-border)", borderRadius: "20px",
          boxShadow: "0 0 60px rgba(0,212,200,0.08), inset 0 1px 0 rgba(0,212,200,0.15)",
          overflow: "hidden",
        }}>
          {loading && <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px" }}>Loading users…</p>}
          {error && <p style={{ color: "var(--error)", textAlign: "center", padding: "40px" }}>{error}</p>}

          {!loading && !error && users.map((u, i) => (
            <div key={u._id || i}
              onClick={() => navigate(`/admin/notes/${u._id}`)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 24px", cursor: "pointer", transition: "background 0.2s",
                borderBottom: i !== users.length - 1 ? "1px solid rgba(0,212,200,0.08)" : "none",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,212,200,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: "15px" }}>{u.username}</p>
                <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "2px" }}>{u.email}</p>
              </div>
              <span style={{ color: "var(--teal)", fontSize: "13px" }}>View notes →</span>
            </div>
          ))}

          {!loading && !error && users.length === 0 && (
            <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px" }}>No users found.</p>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
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
