import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/auth";

const inputStyle = {
  width: "100%", padding: "14px 44px 14px 16px",
  background: "rgba(0,0,0,0.35)", border: "1px solid var(--glass-border)",
  borderRadius: "10px", color: "var(--text)", fontSize: "15px",
  outline: "none", transition: "border 0.3s",
};

function Field({ label, name, type = "text", placeholder, value, onChange, error, showToggle, onToggle, isPassword }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block", color: "var(--muted)", fontSize: "13px",
        letterSpacing: "0.08em", marginBottom: "8px", textTransform: "uppercase"
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          name={name} type={type} placeholder={placeholder}
          value={value} onChange={onChange}
          style={{ ...inputStyle, borderColor: error ? "var(--error)" : "var(--glass-border)" }}
          onFocus={e => e.target.style.borderColor = "var(--teal)"}
          onBlur={e => e.target.style.borderColor = error ? "var(--error)" : "var(--glass-border)"}
        />
        {isPassword && (
          <span onClick={onToggle} style={{
            position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
            cursor: "pointer", fontSize: "16px", color: "var(--muted)", userSelect: "none",
          }}>
            {showToggle ? "🙈" : "👁️"}
          </span>
        )}
      </div>
      {error && <p style={{ color: "var(--error)", fontSize: "12px", marginTop: "5px" }}>{error}</p>}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // forgot password popup
  const [showForgot, setShowForgot] = useState(false);
  const [resetForm, setResetForm] = useState({ email: "", oldPassword: "", newPassword: "" });
  const [resetErrors, setResetErrors] = useState({});
  const [resetMsg, setResetMsg] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleReset = (e) => setResetForm({ ...resetForm, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (mode === "register" && !form.username.trim()) e.username = "Username is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "Password must be 6+ characters";
    if (mode === "register" && form.password !== form.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    setServerMsg("");
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const payload = mode === "login"
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const { data } = await axios.post(API + endpoint, payload);

      if (mode === "register") {
        setServerMsg("✅ Registered! Please log in.");
        setMode("login");
        setForm({ username: "", email: "", password: "", confirm: "" });
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      }
    } catch (err) {
      setServerMsg("❌ " + (err.response?.data?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const validateReset = () => {
    const e = {};
    if (!/\S+@\S+\.\S+/.test(resetForm.email)) e.email = "Enter a valid email";
    if (!resetForm.oldPassword) e.oldPassword = "Enter your current password";
    if (resetForm.newPassword.length < 6) e.newPassword = "New password must be 6+ characters";
    return e;
  };

  const submitReset = async () => {
    const e = validateReset();
    setResetErrors(e);
    setResetMsg("");
    if (Object.keys(e).length) return;

    setResetLoading(true);
    try {
      const { data } = await axios.post(API + "/reset-password", resetForm);
      setResetMsg("✅ " + data.message);
      setTimeout(() => {
        setShowForgot(false);
        setResetForm({ email: "", oldPassword: "", newPassword: "" });
        setResetMsg("");
        setResetErrors({});
      }, 1500);
    } catch (err) {
      setResetMsg("❌ " + (err.response?.data?.message || "Something went wrong"));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 30% 40%, #003d3a 0%, #001a18 40%, #020c10 100%)",
      position: "relative", overflow: "hidden", padding: "20px",
    }}>
      {["20% 30%", "80% 70%", "50% 90%"].map((pos, i) => (
        <div key={i} style={{
          position: "absolute", width: i === 2 ? "300px" : "400px", height: i === 2 ? "200px" : "300px",
          background: "radial-gradient(circle, rgba(0,212,200,0.12) 0%, transparent 70%)",
          top: pos.split(" ")[1], left: pos.split(" ")[0], transform: "translate(-50%,-50%)",
          pointerEvents: "none", filter: "blur(40px)",
        }} />
      ))}

      <div style={{
        position: "relative", width: "420px", padding: "50px 40px 40px",
        background: "rgba(0,40,36,0.45)", backdropFilter: "blur(24px)",
        border: "1px solid var(--glass-border)", borderRadius: "24px",
        boxShadow: "0 0 60px rgba(0,212,200,0.08), inset 0 1px 0 rgba(0,212,200,0.15)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: "32px",
            fontWeight: 900, letterSpacing: "0.25em",
            color: "transparent", backgroundClip: "text", WebkitBackgroundClip: "text",
            backgroundImage: "linear-gradient(135deg, #ffffff 0%, var(--teal) 100%)",
          }}>SPACE</h1>
          <p style={{
            color: "var(--muted)", fontSize: "13px", letterSpacing: "0.2em",
            textTransform: "uppercase", marginTop: "4px"
          }}>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </p>
        </div>

        {mode === "register" && (
          <Field label="Username" name="username" type="text"
            placeholder="your_username" value={form.username}
            onChange={handle} error={errors.username} />
        )}
        <Field label="Email Address" name="email" type="text"
          placeholder="example@gmail.com" value={form.email}
          onChange={handle} error={errors.email} />
        <Field label="Password" name="password" type={showPass ? "text" : "password"}
          placeholder="••••••••" value={form.password}
          onChange={handle} error={errors.password}
          isPassword showToggle={showPass} onToggle={() => setShowPass(!showPass)} />
        {mode === "register" && (
          <Field label="Confirm Password" name="confirm" type={showConfirm ? "text" : "password"}
            placeholder="••••••••" value={form.confirm}
            onChange={handle} error={errors.confirm}
            isPassword showToggle={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
        )}

        {mode === "login" && (
          <p style={{
            color: "var(--teal)", fontSize: "13px", textAlign: "right",
            marginTop: "-10px", marginBottom: "24px", cursor: "pointer"
          }}
            onClick={() => setShowForgot(true)}>
            Forgot Password?
          </p>
        )}

        {serverMsg && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px",
            background: serverMsg.startsWith("✅") ? "rgba(0,212,200,0.1)" : "rgba(255,95,109,0.1)",
            border: `1px solid ${serverMsg.startsWith("✅") ? "var(--teal)" : "var(--error)"}`,
            color: serverMsg.startsWith("✅") ? "var(--teal)" : "var(--error)",
          }}>{serverMsg}</div>
        )}

        <button onClick={submit} disabled={loading} style={{
          width: "100%", padding: "15px", borderRadius: "12px", border: "none",
          background: "linear-gradient(135deg, var(--teal) 0%, #007a74 100%)",
          color: "#001a18", fontSize: "16px", fontWeight: 700,
          fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em",
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
          transition: "transform 0.15s, box-shadow 0.15s",
          boxShadow: "0 4px 24px rgba(0,212,200,0.3)",
        }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 32px rgba(0,212,200,0.45)"; }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(0,212,200,0.3)"; }}>
          {loading ? "..." : mode === "login" ? "LOGIN" : "REGISTER"}
        </button>

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "14px", marginTop: "28px" }}>
          {mode === "login" ? "New here? " : "Already have an account? "}
          <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setServerMsg(""); setErrors({}); }}
            style={{ color: "var(--teal)", fontWeight: 600, cursor: "pointer" }}>
            {mode === "login" ? "Sign Up" : "Log In"}
          </span>
        </p>
      </div>

      {/* Forgot Password Popup */}
      {showForgot && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px",
        }}>
          <div style={{
            width: "400px", maxWidth: "100%", padding: "36px 32px",
            background: "rgba(0,40,36,0.95)", backdropFilter: "blur(24px)",
            border: "1px solid var(--glass-border)", borderRadius: "20px",
            boxShadow: "0 0 60px rgba(0,212,200,0.15)",
          }}>
            <h2 style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: "18px", fontWeight: 700,
              color: "#fff", marginBottom: "6px", textAlign: "center", letterSpacing: "0.08em",
            }}>RESET PASSWORD</h2>
            <p style={{ color: "var(--muted)", fontSize: "12px", textAlign: "center", marginBottom: "24px" }}>
              Enter your email and current password to set a new one
            </p>

            <Field label="Email Address" name="email" type="text"
              placeholder="example@gmail.com" value={resetForm.email}
              onChange={handleReset} error={resetErrors.email} />
            <Field label="Current Password" name="oldPassword" type={showOld ? "text" : "password"}
              placeholder="••••••••" value={resetForm.oldPassword}
              onChange={handleReset} error={resetErrors.oldPassword}
              isPassword showToggle={showOld} onToggle={() => setShowOld(!showOld)} />
            <Field label="New Password" name="newPassword" type={showNew ? "text" : "password"}
              placeholder="••••••••" value={resetForm.newPassword}
              onChange={handleReset} error={resetErrors.newPassword}
              isPassword showToggle={showNew} onToggle={() => setShowNew(!showNew)} />

            {resetMsg && (
              <div style={{
                padding: "10px 14px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px",
                background: resetMsg.startsWith("✅") ? "rgba(0,212,200,0.1)" : "rgba(255,95,109,0.1)",
                border: `1px solid ${resetMsg.startsWith("✅") ? "var(--teal)" : "var(--error)"}`,
                color: resetMsg.startsWith("✅") ? "var(--teal)" : "var(--error)",
              }}>{resetMsg}</div>
            )}

            <button onClick={submitReset} disabled={resetLoading} style={{
              width: "100%", padding: "14px", borderRadius: "12px", border: "none",
              background: "linear-gradient(135deg, var(--teal) 0%, #007a74 100%)",
              color: "#001a18", fontSize: "14px", fontWeight: 700,
              fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.12em",
              cursor: resetLoading ? "not-allowed" : "pointer", opacity: resetLoading ? 0.7 : 1,
              marginBottom: "10px",
            }}>
              {resetLoading ? "..." : "UPDATE PASSWORD"}
            </button>

            <button onClick={() => {
              setShowForgot(false);
              setResetForm({ email: "", oldPassword: "", newPassword: "" });
              setResetErrors({}); setResetMsg("");
            }} style={{
              width: "100%", padding: "12px", borderRadius: "12px",
              border: "1px solid rgba(0,212,200,0.3)", background: "transparent",
              color: "var(--teal)", fontSize: "13px", fontWeight: 700,
              fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.12em", cursor: "pointer",
            }}>
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
