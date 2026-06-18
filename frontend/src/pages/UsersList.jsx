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
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "50px 20px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "26px", fontWeight: 800, color: "var(--ink)" }}>
            All Users
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "12px", marginTop: "8px" }}>
            Click any user to view their notes
          </p>
        </div>

        <div style={{
          background: "#fff", border: "1.5px solid var(--border)",
          borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}>
          {loading && <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px" }}>Loading users…</p>}
          {error && <p style={{ color: "var(--error)", textAlign: "center", padding: "40px" }}>{error}</p>}

          {!loading && !error && users.map((u, i) => (
            <div key={u._id || i}
              onClick={() => navigate(`/admin/notes/${u._id}`)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 24px", cursor: "pointer", transition: "background 0.2s",
                borderBottom: i !== users.length - 1 ? "1px solid var(--border)" : "none",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div>
                <p style={{ color: "var(--ink)", fontWeight: 700, fontSize: "15px" }}>{u.username}</p>
                <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "2px" }}>{u.email}</p>
              </div>
              <span style={{ color: "var(--ink)", fontSize: "13px", fontWeight: 600 }}>View notes →</span>
            </div>
          ))}

          {!loading && !error && users.length === 0 && (
            <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px" }}>No users found.</p>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={() => navigate("/dashboard")} style={{
            padding: "12px 28px", borderRadius: "10px",
            border: "1.5px solid var(--border)", background: "#fff",
            color: "var(--ink)", fontSize: "13px", fontWeight: 700,
            fontFamily: "'Poppins', sans-serif", cursor: "pointer",
          }}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
