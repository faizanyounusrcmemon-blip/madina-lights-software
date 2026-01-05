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
        background:
          "radial-gradient(circle at top, #e0f7fa, #ffffff 80%)",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: 360,
          padding: 28,
          borderRadius: 20,
          background: "#ffffff",
          boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
          border: "1px solid rgba(200,200,200,0.3)",
          color: "#333",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 20,
            textAlign: "center",
            fontWeight: 800,
            letterSpacing: 1,
            color: "#4dabf7",
          }}
        >
          💡 Madina Lights 💡
        </h2>

        <label style={{ fontSize: 13, color: "#555" }}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            marginTop: 6,
            marginBottom: 16,
            border: "1px solid #cfd8dc",
            background: "#f9fbfd",
            color: "#333",
            outline: "none",
            transition: "all 0.3s ease",
          }}
        />

        <label style={{ fontSize: 13, color: "#555" }}>Password</label>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #cfd8dc",
              background: "#f9fbfd",
              color: "#333",
              outline: "none",
              transition: "all 0.3s ease",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{
              padding: "0 14px",
              borderRadius: 12,
              border: "none",
              background: "#a0e7ff",
              color: "#333",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {showPw ? "🙈" : "👁"}
          </button>
        </div>

        {msg && (
          <div
            style={{
              marginTop: 14,
              marginBottom: 14,
              fontSize: 14,
              color: msg.startsWith("✅") ? "#4caf50" : "#f44336",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg,#81d4fa,#b3e5fc)",
              color: "#333",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(129,212,250,0.3)",
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
              padding: "12px 0",
              borderRadius: 14,
              border: "1px solid #cfd8dc",
              background: "#ffffff",
              color: "#555",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
