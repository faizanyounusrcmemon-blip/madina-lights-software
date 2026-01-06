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

  if (loading) return <div className="page-loading">⏳ Loading...</div>;
  if (error) return <div className="page-error">❌ {error}</div>;

  return (
    <div ref={containerRef} className="page-wrapper">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2>💡 Madina Lights Dashboard</h2>
          <small>System overview</small>
        </div>
        <small>Software by Faizan Younus</small>
      </div>

      {/* CARDS */}
      <div className="dashboard-grid">
        <div className="card dark-card">
          <h3>☁ Last Backup</h3>
          <p className="big-text">{lastBackup || "No backup found"}</p>

          <button
            className="primary-btn"
            onClick={takeBackup}
            disabled={isBackingUp}
          >
            ☁ {isBackingUp ? "Backing Up..." : "Backup Now"}
          </button>

          {isBackingUp && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${backupProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="dashboard-mini">
          <div className="card dark-card center">
            <div className="icon">💡</div>
            <small>Items</small>
            <h3>{items.length}</h3>
          </div>

          <div className="card dark-card center">
            <div className="icon">✅</div>
            <small>Status</small>
            <h3 className="success">All Good</h3>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="card dark-card">
        <div className="card-header">
          <h3>🔍 Quick Items Preview</h3>
          <button
            className="secondary-btn"
            onClick={() => setShowList(!showList)}
          >
            {showList ? "Hide ▲" : "Show ▼"}
          </button>
        </div>

        {showList && (
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td>{i.code}</td>
                  <td>{i.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
