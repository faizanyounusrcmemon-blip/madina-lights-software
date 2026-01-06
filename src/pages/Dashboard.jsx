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

  /* ================= LOAD BACKUP ================= */
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

  /* ================= LOAD ITEMS ================= */
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Supabase client not initialized");
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .limit(10);

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

  /* ================= BACKUP ================= */
  async function takeBackup() {
    const pwd = prompt("Enter backup password:");
    if (pwd !== "8515") {
      alert("❌ Incorrect Password");
      return;
    }

    setIsBackingUp(true);
    setBackupProgress(0);

    const timer = setInterval(() => {
      setBackupProgress((p) => (p < 90 ? p + 5 : p));
    }, 150);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/backup`,
        { method: "POST" }
      );
      const data = await res.json();

      clearInterval(timer);
      setBackupProgress(100);

      setTimeout(() => {
        setIsBackingUp(false);
        setBackupProgress(0);
        loadLastBackup();
      }, 600);

      alert(data.success ? "✅ Backup Completed" : "❌ Backup Failed");
    } catch (err) {
      clearInterval(timer);
      setIsBackingUp(false);
      setBackupProgress(0);
      alert("❌ Backup Error");
    }
  }

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#ffca57",
          fontSize: 24,
        }}
      >
        ⏳ Loading...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#ff5555",
          fontSize: 20,
        }}
      >
        ❌ {error}
      </div>
    );

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: "Inter, sans-serif",
        padding: 20,
        background: "#0e0e0e",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ color: "#ffca57", margin: 0 }}>💡 Madina Lights Dashboard</h2>
          <small style={{ color: "#aaa" }}>System overview</small>
        </div>
        <small style={{ color: "#888" }}>Software by Faizan Younus</small>
      </div>

      {/* CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: 12,
            padding: 20,
            position: "relative",
            boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
          }}
        >
          <h3 style={{ margin: 0, color: "#ffca57" }}>☁ Last Backup</h3>
          <p style={{ fontSize: 22, fontWeight: "bold", margin: "10px 0" }}>
            {lastBackup || "No backup found"}
          </p>

          <button
            onClick={takeBackup}
            disabled={isBackingUp}
            style={{
              width: "100%",
              padding: "10px 0",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              fontSize: 16,
              color: "#fff",
              background: isBackingUp
                ? "linear-gradient(90deg,#aaa,#888)"
                : "linear-gradient(90deg,#ffb400,#ff6a00)",
              cursor: isBackingUp ? "not-allowed" : "pointer",
              boxShadow: "0 5px 10px rgba(0,0,0,0.5)",
              transition: "0.3s all",
              marginBottom: 10,
            }}
          >
            {isBackingUp ? `Backing Up... ${backupProgress}%` : "Backup Now"}
          </button>

          {isBackingUp && (
            <div
              style={{
                width: "100%",
                height: 8,
                borderRadius: 4,
                background: "#333",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${backupProgress}%`,
                  background: "#0bd46e",
                  transition: "width 0.2s",
                }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 5 }}>💡</div>
            <small style={{ color: "#aaa" }}>Items</small>
            <h3 style={{ margin: "5px 0", color: "#0bd46e" }}>{items.length}</h3>
          </div>

          <div
            style={{
              background: "#1a1a1a",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 5 }}>✅</div>
            <small style={{ color: "#aaa" }}>Status</small>
            <h3 style={{ margin: "5px 0", color: "#0bd46e" }}>All Good</h3>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div
        style={{
          background: "#1a1a1a",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h3 style={{ color: "#ffca57" }}>🔍 Quick Items Preview</h3>
          <button
            onClick={() => setShowList(!showList)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              background: "linear-gradient(90deg,#ffb400,#ff6a00)",
              color: "#fff",
              boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
            }}
          >
            {showList ? "Hide ▲" : "Show ▼"}
          </button>
        </div>

        {showList && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: 14,
              }}
            >
              <thead style={{ background: "#222", color: "#ffca57" }}>
                <tr>
                  <th style={{ padding: "8px 12px" }}>Code</th>
                  <th style={{ padding: "8px 12px" }}>Name</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr
                    key={i.id}
                    style={{
                      borderBottom: "1px solid #333",
                      transition: "0.2s all",
                    }}
                  >
                    <td style={{ padding: "6px 12px" }}>{i.code}</td>
                    <td style={{ padding: "6px 12px" }}>{i.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
