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
      monthly_report: !!data.monthly_report,
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
        background: "radial-gradient(circle at top, #d0f8ff, #e6f7ff 85%)",
        transition: "background 0.5s ease",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: 360,
          padding: 30,
          borderRadius: 22,
          background: "linear-gradient(145deg, #ffffff, #f0faff)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
          border: "1px solid rgba(200,200,200,0.25)",
          color: "#333",
          transition: "all 0.3s ease",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 22,
            textAlign: "center",
            fontWeight: 900,
            letterSpacing: 1,
            color: "#4dabf7",
          }}
        >
          💡 Madina Lights 💡
        </h2>

        <label style={{ fontSize: 14, color: "#555" }}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 14,
            marginTop: 8,
            marginBottom: 18,
            border: "1px solid #cfd8dc",
            background: "#f2fbff",
            color: "#333",
            outline: "none",
            fontSize: 14,
            transition: "all 0.3s ease",
          }}
        />

        <label style={{ fontSize: 14, color: "#555" }}>Password</label>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid #cfd8dc",
              background: "#f2fbff",
              color: "#333",
              outline: "none",
              fontSize: 14,
              transition: "all 0.3s ease",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{
              padding: "0 14px",
              borderRadius: 14,
              border: "none",
              background: "#a0e7ff",
              color: "#333",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 10px rgba(160,231,255,0.4)",
            }}
          >
            {showPw ? "🙈" : "👁"}
          </button>
        </div>

        {msg && (
          <div
            style={{
              marginTop: 16,
              marginBottom: 16,
              fontSize: 14,
              color: msg.startsWith("✅") ? "#4caf50" : "#f44336",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg,#81d4fa,#b3e5fc)",
              color: "#333",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(129,212,250,0.35)",
              transition: "all 0.3s ease",
            }}
          >
            Login
          </button>

          <button
            type="button"
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 16,
              border: "1px solid #cfd8dc",
              background: "#ffffff",
              color: "#555",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
