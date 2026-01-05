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
  const containerRef = useRef(null);

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
        background: "#f4f9ff",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(90deg,#4da3ff,#6ec6ff)",
          padding: "18px 24px",
          borderRadius: 14,
          color: "white",
          marginBottom: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 8px 20px rgba(77,163,255,0.4)",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>📊 Madina Lights Dashboard</h2>
          <small>System overview & status</small>
        </div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          Software by Faizan Younus
        </div>
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
        <div className="card">
          <h3 style={{ marginTop: 0, color: "#1e88e5" }}>
            ☁ Last Backup
          </h3>
          <p style={{ fontSize: 18, fontWeight: "bold" }}>
            {lastBackup || "No backup found"}
          </p>
          <small style={{ color: "#6b7280" }}>
            Your data is protected safely
          </small>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>💍</div>
            <small>Items</small>
            <h3 style={{ margin: 4 }}>{items.length}</h3>
          </div>

          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>✅</div>
            <small>Status</small>
            <h3 style={{ margin: 4, color: "#22c55e" }}>All Good</h3>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: "#1e88e5" }}>
              🔍 Quick Items Preview
            </h3>
            <small>First 10 items</small>
          </div>

          <button onClick={() => setShowList(!showList)}>
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
