import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api/auth";

const inputStyle = {
  width: "100%", padding: "14px 44px 14px 16px",
  background: "#fafafa", border: "1.5px solid var(--border)",
  borderRadius: "10px", color: "var(--ink)", fontSize: "15px",
  outline: "none", transition: "border 0.2s", fontFamily: "'Inter', sans-serif",
};

function Field({ label, name, type = "text", placeholder, value, onChange, error, showToggle, onToggle, isPassword }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{
        display: "block", color: "var(--ink)", fontSize: "13px",
        fontWeight: 600, marginBottom: "8px",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          name={name} type={type} placeholder={placeholder}
          value={value} onChange={onChange}
          style={{ ...inputStyle, borderColor: error ? "var(--error)" : "var(--border)" }}
          onFocus={e => e.target.style.borderColor = "var(--ink)"}
          onBlur={e => e.target.style.borderColor = error ? "var(--error)" : "var(--border)"}
        />
        {isPassword && (
          <span onClick={onToggle} style={{
            position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
            cursor: "pointer", fontSize: "16px", userSelect: "none",
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
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      background: "#fafafa", padding: "20px",
    }}>
      <div style={{
        width: "420px", padding: "44px 40px",
        background: "#ffffff", border: "1.5px solid var(--border)",
        borderRadius: "20px", boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{
            fontFamily: "'Poppins', sans-serif", fontSize: "30px",
            fontWeight: 800, letterSpacing: "0.05em", color: "var(--ink)",
          }}>SPACE</h1>
          <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "4px" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
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
            color: "var(--ink)", fontSize: "13px", textAlign: "right", fontWeight: 600,
            marginTop: "-6px", marginBottom: "22px", cursor: "pointer", textDecoration: "underline",
          }}
            onClick={() => setShowForgot(true)}>
            Forgot Password?
          </p>
        )}

        {serverMsg && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px", marginBottom: "18px", fontSize: "13px",
            background: serverMsg.startsWith("✅") ? "rgba(45,157,110,0.08)" : "rgba(232,80,91,0.08)",
            border: `1.5px solid ${serverMsg.startsWith("✅") ? "var(--success)" : "var(--error)"}`,
            color: serverMsg.startsWith("✅") ? "var(--success)" : "var(--error)",
          }}>{serverMsg}</div>
        )}

        <button onClick={submit} disabled={loading} style={{
          width: "100%", padding: "15px", borderRadius: "12px", border: "none",
          background: "var(--ink)", color: "#fff", fontSize: "15px", fontWeight: 700,
          fontFamily: "'Poppins', sans-serif", letterSpacing: "0.04em",
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
          transition: "transform 0.15s",
        }}
          onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.target.style.transform = "translateY(0)"}>
          {loading ? "..." : mode === "login" ? "LOGIN" : "REGISTER"}
        </button>

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "14px", marginTop: "24px" }}>
          {mode === "login" ? "New here? " : "Already have an account? "}
          <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setServerMsg(""); setErrors({}); }}
            style={{ color: "var(--ink)", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
            {mode === "login" ? "Sign Up" : "Log In"}
          </span>
        </p>
      </div>

      {showForgot && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px",
        }}>
          <div style={{
            width: "400px", maxWidth: "100%", padding: "34px 32px",
            background: "#fff", border: "1.5px solid var(--border)",
            borderRadius: "18px", boxShadow: "0 10px 50px rgba(0,0,0,0.15)",
          }}>
            <h2 style={{
              fontFamily: "'Poppins', sans-serif", fontSize: "18px", fontWeight: 700,
              color: "var(--ink)", marginBottom: "6px", textAlign: "center",
            }}>RESET PASSWORD</h2>
            <p style={{ color: "var(--muted)", fontSize: "12px", textAlign: "center", marginBottom: "22px" }}>
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
                background: resetMsg.startsWith("✅") ? "rgba(45,157,110,0.08)" : "rgba(232,80,91,0.08)",
                border: `1.5px solid ${resetMsg.startsWith("✅") ? "var(--success)" : "var(--error)"}`,
                color: resetMsg.startsWith("✅") ? "var(--success)" : "var(--error)",
              }}>{resetMsg}</div>
            )}

            <button onClick={submitReset} disabled={resetLoading} style={{
              width: "100%", padding: "14px", borderRadius: "12px", border: "none",
              background: "var(--ink)", color: "#fff", fontSize: "14px", fontWeight: 700,
              fontFamily: "'Poppins', sans-serif", cursor: resetLoading ? "not-allowed" : "pointer",
              opacity: resetLoading ? 0.7 : 1, marginBottom: "10px",
            }}>
              {resetLoading ? "..." : "UPDATE PASSWORD"}
            </button>

            <button onClick={() => {
              setShowForgot(false);
              setResetForm({ email: "", oldPassword: "", newPassword: "" });
              setResetErrors({}); setResetMsg("");
            }} style={{
              width: "100%", padding: "12px", borderRadius: "12px",
              border: "1.5px solid var(--border)", background: "transparent",
              color: "var(--ink)", fontSize: "13px", fontWeight: 700,
              fontFamily: "'Poppins', sans-serif", cursor: "pointer",
            }}>
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
