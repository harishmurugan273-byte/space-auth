import React from 'react';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return navigate("/");
    setUser(JSON.parse(stored));
  }, [navigate]);

  const logout = () => { localStorage.removeItem("user"); navigate("/"); };

  if (!user) return null;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#fafafa", padding: "20px",
    }}>
      <div style={{
        width: "380px", padding: "44px 36px",
        background: "#fff", border: "1.5px solid var(--border)",
        borderRadius: "20px", boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        textAlign: "center",
      }}>
        <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "8px" }}>WELCOME</p>
        <h2 style={{
          fontFamily: "'Poppins', sans-serif", fontSize: "24px", fontWeight: 700,
          color: "var(--ink)", marginBottom: "32px",
        }}>{user.username}</h2>

        {user.isAdmin && (
          <button onClick={() => navigate("/users")} style={{
            width: "100%", padding: "15px", borderRadius: "12px", border: "none",
            background: "var(--ink)", color: "#fff", fontSize: "14px", fontWeight: 700,
            fontFamily: "'Poppins', sans-serif", cursor: "pointer", marginBottom: "12px",
          }}>
            VIEW ALL USERS
          </button>
        )}

        <button onClick={() => navigate("/notes")} style={{
          width: "100%", padding: "15px", borderRadius: "12px", border: "none",
          background: "var(--ink)", color: "#fff", fontSize: "14px", fontWeight: 700,
          fontFamily: "'Poppins', sans-serif", cursor: "pointer",
        }}>
          📝 MY NOTES
        </button>

        <button onClick={logout} style={{
          marginTop: "12px", width: "100%", padding: "14px",
          borderRadius: "12px", border: "1.5px solid var(--border)",
          background: "transparent", color: "var(--ink)",
          fontSize: "13px", fontWeight: 700, fontFamily: "'Poppins', sans-serif", cursor: "pointer",
        }}>
          LOGOUT
        </button>
      </div>
    </div>
  );
}
