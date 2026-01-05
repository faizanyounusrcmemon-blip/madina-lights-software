import React, { useState } from "react";
import supabase from "../utils/supabaseClient";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("");

    const { data, error } = await supabase
      .from("app_users")
      .select(
        "id, username, role, password, sale_entry, sale_return, sale_detail, sale_item_detail, purchase_entry, purchase_return, purchase_detail, purchase_item_detail, item_profile, customer_profile, manage_users, stock_report, sale_report, monthly_report"
      )
      .eq("username", username)
      .maybeSingle();

    if (error || !data || data.password !== password) {
      setMsg("❌ غلط username یا password");
      return;
    }

    const userObj = {
      id: data.id,
      username: data.username,
      role: data.role,
      sale_entry: !!data.sale_entry,
      sale_return: !!data.sale_return,
      sale_detail: !!data.sale_detail,
      sale_item_detail: !!data.sale_item_detail,
      purchase_entry: !!data.purchase_entry,
      purchase_return: !!data.purchase_return,
      purchase_detail: !!data.purchase_detail,
      purchase_item_detail: !!data.purchase_item_detail,
      item_profile: !!data.item_profile,
      customer_profile: !!data.customer_profile,
      manage_users: !!data.manage_users,
      stock_report: !!data.stock_report,
      sale_report: !!data.sale_report,
      monthly_report: !!data.monthly_report
    };

    sessionStorage.setItem("user", JSON.stringify(userObj));
    setMsg("✅ Login successful");
    onLogin(userObj);
  }

  function handleCancel() {
    setUsername("");
    setPassword("");
    setMsg("");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, #1e3c72, #0f2027 70%)",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: 360,
          padding: 26,
          borderRadius: 16,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#eaf6ff",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 18,
            textAlign: "center",
            fontWeight: 800,
            letterSpacing: 1,
            color: "#8fd3ff",
          }}
        >
          💡 Madina Lights 💡
        </h2>

        <label style={{ fontSize: 13, opacity: 0.85 }}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            marginTop: 4,
            marginBottom: 14,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            outline: "none",
          }}
        />

        <label style={{ fontSize: 13, opacity: 0.85 }}>Password</label>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(0,0,0,0.35)",
              color: "#fff",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{
              padding: "0 12px",
              borderRadius: 10,
              border: "none",
              background: "#4dabf7",
              color: "#000",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {showPw ? "🙈" : "👁"}
          </button>
        </div>

        {msg && (
          <div
            style={{
              marginTop: 12,
              marginBottom: 12,
              fontSize: 14,
              color: msg.startsWith("✅") ? "#9fffb0" : "#ff9f9f",
              textAlign: "center",
            }}
          >
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#4dabf7,#74c0fc)",
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Login
          </button>

          <button
            type="button"
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "transparent",
              color: "#eaf6ff",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
