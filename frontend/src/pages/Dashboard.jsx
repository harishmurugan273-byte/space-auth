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
      background: "radial-gradient(ellipse at 70% 30%, #003d3a 0%, #001a18 40%, #020c10 100%)",
      position: "relative", overflow: "hidden", padding: "20px",
    }}>
      <div style={{
        position: "absolute", width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(0,212,200,0.1) 0%, transparent 70%)",
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", width: "400px", padding: "50px 40px",
        background: "rgba(0,40,36,0.5)", backdropFilter: "blur(30px)",
        border: "1px solid rgba(0,212,200,0.2)", borderRadius: "28px",
        boxShadow: "0 0 80px rgba(0,212,200,0.07), inset 0 1px 0 rgba(0,212,200,0.12)",
        textAlign: "center",
      }}>
        <p style={{
          color: "rgba(0,212,200,0.6)", fontSize: "11px",
          letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "10px"
        }}>Welcome</p>

        <h2 style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: "26px", fontWeight: 700,
          color: "#fff", letterSpacing: "0.08em", marginBottom: "36px",
        }}>{user.username}</h2>

        {user.isAdmin && (
  <button onClick={() => navigate("/users")} style={{
    width: "100%", padding: "15px", borderRadius: "12px", border: "none",
    background: "linear-gradient(135deg, var(--teal) 0%, #007a74 100%)",
    color: "#001a18", fontSize: "14px", fontWeight: 700,
    fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.12em", cursor: "pointer",
    boxShadow: "0 4px 24px rgba(0,212,200,0.3)", marginBottom: "12px",
  }}>
    VIEW ALL USERS
  </button>
)}

<button onClick={() => navigate("/notes")} style={{
  width: "100%", padding: "15px", borderRadius: "12px", border: "none",
  background: "linear-gradient(135deg, var(--teal) 0%, #007a74 100%)",
  color: "#001a18", fontSize: "14px", fontWeight: 700,
  fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.12em", cursor: "pointer",
  boxShadow: "0 4px 24px rgba(0,212,200,0.3)",
}}>
  📝 MY NOTES
</button>

        <button onClick={logout} style={{
          marginTop: "14px", width: "100%", padding: "14px",
          borderRadius: "12px", border: "1px solid rgba(0,212,200,0.3)",
          background: "transparent", color: "var(--teal)",
          fontSize: "13px", fontWeight: 700, fontFamily: "'Orbitron', sans-serif",
          letterSpacing: "0.2em", cursor: "pointer", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.target.style.background = "rgba(0,212,200,0.08)"; e.target.style.borderColor = "var(--teal)"; }}
          onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(0,212,200,0.3)"; }}>
          LOGOUT
        </button>
      </div>
    </div>
  );
}
