import React, { useState } from "react";
import supabase from "../utils/supabaseClient";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("Logging in... ⏳");

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
        background: "radial-gradient(circle at center, #f9f9f9, #ffe6f0, #ffb3c6)",
        transition: "background 1s ease",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          width: 400,
          padding: 36,
          borderRadius: 28,
          background: "linear-gradient(145deg, #ffffff, #ffe6f0)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          border: "1px solid rgba(255,200,220,0.3)",
          color: "#333",
          transition: "all 0.4s ease",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 28,
            fontWeight: 900,
            letterSpacing: 2,
            color: "#ff6b6b",
            textShadow: "2px 2px 6px #ffb6b9",
            fontSize: 28,
          }}
        >
          💡 Madina Lights 💡
        </h2>

        <label style={{ fontSize: 14, color: "#845ec2", fontWeight: 600, float: "left" }}>
          Username
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 18,
            marginTop: 6,
            marginBottom: 20,
            border: "2px solid #d4a5a5",
            background: "linear-gradient(120deg, #fff0f5, #ffe6f0)",
            color: "#333",
            outline: "none",
            fontSize: 14,
            transition: "all 0.3s ease",
            boxShadow: "inset 0 3px 8px rgba(0,0,0,0.08)",
          }}
        />

        <label style={{ fontSize: 14, color: "#845ec2", fontWeight: 600, float: "left" }}>
          Password
        </label>
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              flex: 1,
              padding: "14px 18px",
              borderRadius: 18,
              border: "2px solid #d4a5a5",
              background: "linear-gradient(120deg, #fff0f5, #ffe6f0)",
              color: "#333",
              outline: "none",
              fontSize: 14,
              transition: "all 0.3s ease",
              boxShadow: "inset 0 3px 8px rgba(0,0,0,0.08)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{
              padding: "0 18px",
              borderRadius: 18,
              border: "none",
              background: "linear-gradient(135deg, #845ec2, #d65db1)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 6px 14px rgba(132,94,194,0.5)",
              fontSize: 18,
            }}
            title={showPw ? "Hide Password" : "Show Password"}
          >
            {showPw ? "🙈" : "👁"}
          </button>
        </div>

        {msg && (
          <div
            style={{
              marginTop: 16,
              marginBottom: 16,
              fontSize: 15,
              color: msg.startsWith("✅") ? "#4caf50" : "#ff1744",
              textAlign: "center",
              fontWeight: 700,
              textShadow: "0 0 2px #fff",
            }}
          >
            {msg}
          </div>
        )}

        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 22,
              border: "none",
              background: "linear-gradient(135deg,#ff758c,#ff7eb3,#ffb347)",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(255,123,123,0.45)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Login
          </button>

          <button
            type="button"
            onClick={handleCancel}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 22,
              border: "1px solid #ffb347",
              background: "linear-gradient(145deg,#fff1f3,#ffe6f0)",
              color: "#ff6b6b",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "inset 0 3px 8px rgba(255,107,107,0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Cancel
          </button>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: "#845ec2" }}>
          Tip: Enter your username and password to login 🔑
        </p>
      </form>
    </div>
  );
}
