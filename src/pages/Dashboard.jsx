import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(false);
  const [lastBackup, setLastBackup] = useState("");
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const containerRef = useRef(null);

  // ==============================
  // Load Last Backup Date
  // ==============================
  useEffect(() => {
    loadLastBackup();
  }, []);

  async function loadLastBackup() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/list-backups`
      );
      const data = await res.json();
      if (data.success && data.files.length > 0) {
        setLastBackup(data.files[0].date);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ==============================
  // Load Items
  // ==============================
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Supabase client not initialized");
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.from("items").select("*").limit(10);

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ==============================
  // Hide List on Outside Click
  // ==============================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==============================
  // Take Backup Function
  // ==============================
  async function takeBackup() {
    const pwd = prompt("Enter backup password:");
    if (!pwd) return;
    if (pwd !== "8515") {
      alert("❌ Incorrect Password!");
      return;
    }

    setBackupProgress(0);
    setIsBackingUp(true);

    const int = setInterval(() => {
      setBackupProgress((p) => (p >= 90 ? 90 : p + 5));
    }, 150);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/backup`, {
        method: "POST",
      });
      const data = await res.json();

      clearInterval(int);
      setBackupProgress(100);

      setTimeout(() => {
        setBackupProgress(0);
        setIsBackingUp(false);
        loadLastBackup(); // Refresh last backup
      }, 700);

      alert(data.success ? "✅ Backup Completed!" : "❌ " + data.error);
    } catch (err) {
      clearInterval(int);
      setBackupProgress(0);
      setIsBackingUp(false);
      alert("❌ Backup failed: " + err.message);
    }
  }

  if (loading)
    return <div style={{ padding: 30 }}>⏳ Dashboard loading...</div>;

  if (error)
    return (
      <div style={{ padding: 30, color: "red", fontWeight: "bold" }}>
        ❌ {error}
      </div>
    );

  return (
    <div
      ref={containerRef}
      style={{
        padding: 24,
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #d0f0ff, #e6f7ff)",
        fontFamily: "Inter, system-ui, sans-serif",
        transition: "background 0.5s ease",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(90deg,#4da3ff,#6ec6ff)",
          padding: "18px 24px",
          borderRadius: 16,
          color: "white",
          marginBottom: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 8px 20px rgba(77,163,255,0.4)",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>💡 Madina Lights 💡 Dashboard</h2>
          <small>System overview & status</small>
        </div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>Software by Faizan Younus</div>
      </div>

      {/* TOP CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 18,
          marginBottom: 22,
        }}
      >
        {/* LAST BACKUP CARD */}
        <div
          className="card"
          style={{
            background: "#e0f7fa",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            position: "relative",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#1e88e5" }}>☁ Last Backup</h3>
          <p style={{ fontSize: 18, fontWeight: "bold" }}>
            {lastBackup || "No backup found"}
          </p>
          <small style={{ color: "#6b7280" }}>Your data is protected safely</small>

          {/* BACKUP BUTTON */}
          <div style={{ marginTop: 12 }}>
            <button
              onClick={takeBackup}
              disabled={isBackingUp}
              style={{
                background: isBackingUp ? "#6c757d" : "#0d6efd",
                color: "white",
                padding: "6px 12px",
                fontSize: 14,
                borderRadius: 8,
                cursor: "pointer",
                border: "none",
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
            >
              ☁ {isBackingUp ? "Backing Up..." : "Backup Now"}
            </button>

            {/* PROGRESS BAR */}
            {isBackingUp && (
              <div
                style={{
                  width: "100%",
                  height: 6,
                  background: "#ccc",
                  borderRadius: 4,
                  marginTop: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${backupProgress}%`,
                    height: "100%",
                    background: "#28a745",
                    borderRadius: 4,
                    transition: "0.2s",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* OTHER STATUS CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div
            className="card"
            style={{
              background: "#e0f7fa",
              borderRadius: 16,
              padding: 18,
              textAlign: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: 28 }}>💡</div>
            <small>Items</small>
            <h3 style={{ margin: 4 }}>{items.length}</h3>
          </div>

          <div
            className="card"
            style={{
              background: "#e0f7fa",
              borderRadius: 16,
              padding: 18,
              textAlign: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: 28 }}>✅</div>
            <small>Status</small>
            <h3 style={{ margin: 4, color: "#22c55e" }}>All Good</h3>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div
        className="card"
        style={{
          background: "#e0f7fa",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: "#1e88e5" }}>🔍 Quick Items Preview</h3>
            <small>First 10 items</small>
          </div>

          <button
            style={{
              padding: "6px 12px",
              borderRadius: 10,
              border: "none",
              background: "#81d4fa",
              color: "#333",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onClick={() => setShowList(!showList)}
          >
            {showList ? "Hide ▲" : "Show ▼"}
          </button>
        </div>

        {showList && (
          <div style={{ maxHeight: 260, overflow: "auto" }}>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="2" style={{ textAlign: "center" }}>
                      No items found
                    </td>
                  </tr>
                ) : (
                  items.map((i) => (
                    <tr key={i.id}>
                      <td>{i.code}</td>
                      <td>{i.name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
