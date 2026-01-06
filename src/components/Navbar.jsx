import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";

export default function Navbar({ onNavigate = () => {} }) {
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  const user = JSON.parse(sessionStorage.getItem("user")) || {};

  const can = (perm) =>
    user?.role === "admin" || user?.[perm] === true;

  // 🔹 Outside click close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  const handleNavigate = (route) => {
    setOpenMenu(null);
    onNavigate(route);
  };

  return (
    <div className="topbar" ref={navRef}>
      <div className="nav-left">

        {/* BRAND */}
        <div
          className="brand"
          style={{ cursor: "pointer" }}
          onClick={() => handleNavigate("dashboard")}
        >
          💡 Madina Lights 💡
        </div>

        {/* SALES */}
        <div className="menu">
          <button
            className={`menu-btn ${openMenu === "sales" ? "active" : ""}`}
            onClick={() => toggleMenu("sales")}
          >
            🛒 Sales
          </button>

          {openMenu === "sales" && (
            <div className="menu-list">
              {can("sale_entry") && <button onClick={() => handleNavigate("sale-entry")}>Sale Entry</button>}
              {can("sale_return") && <button onClick={() => handleNavigate("sale-return")}>Sale Return</button>}
              {can("sale_return_detail") && <button onClick={() => handleNavigate("sale-return-detail")}>Sale Return Detail</button>}
              {can("sale_detail") && <button onClick={() => handleNavigate("sale-detail")}>Sale Detail</button>}
              {can("sale_item_detail") && <button onClick={() => handleNavigate("sale-item-detail")}>Sale Item Detail</button>}
            </div>
          )}
        </div>

        {/* PURCHASE */}
        <div className="menu">
          <button
            className={`menu-btn ${openMenu === "purchase" ? "active" : ""}`}
            onClick={() => toggleMenu("purchase")}
          >
            📦 Purchase
          </button>

          {openMenu === "purchase" && (
            <div className="menu-list">
              {can("purchase_entry") && <button onClick={() => handleNavigate("purchase-entry")}>Purchase Entry</button>}
              {can("purchase_return") && <button onClick={() => handleNavigate("purchase-return")}>Purchase Return</button>}
              {can("purchase_detail") && <button onClick={() => handleNavigate("purchase-detail")}>Purchase Detail</button>}
              {can("purchase_item_detail") && <button onClick={() => handleNavigate("purchase-item-detail")}>Purchase Item Detail</button>}
            </div>
          )}
        </div>

        {/* MASTER */}
        <div className="menu">
          <button
            className={`menu-btn ${openMenu === "master" ? "active" : ""}`}
            onClick={() => toggleMenu("master")}
          >
            📇 Master
          </button>

          {openMenu === "master" && (
            <div className="menu-list">
              {can("item_profile") && <button onClick={() => handleNavigate("item-profile")}>Item Profile</button>}
              {can("customer_profile") && <button onClick={() => handleNavigate("customer-profile")}>Customer Profile</button>}
              {can("manage_users") && <button onClick={() => handleNavigate("manage-users")}>Manage Users</button>}
              {can("create_user") && <button onClick={() => handleNavigate("create-user")}>➕ Create User</button>}
            </div>
          )}
        </div>

        {/* OPENING STOCK */}
        <div className="menu">
          <button
            className={`menu-btn ${openMenu === "openingStock" ? "active" : ""}`}
            onClick={() => toggleMenu("openingStock")}
          >
            🧊 Opening Stock
          </button>

          {openMenu === "openingStock" && (
            <div className="menu-list">
              {can("opening_stock_generate") && <button onClick={() => handleNavigate("archive-stock")}>📦 Archive & Opening Stock</button>}
              {can("opening_stock_generate") && <button onClick={() => handleNavigate("snapshot-report")}>📸 Snapshot Report</button>}
              {can("opening_stock_generate") && <button onClick={() => handleNavigate("snapshot-history")}>📸 Snapshot History</button>}
              {can("memory_status") && <button onClick={() => handleNavigate("memory-status")}>📊 Memory Status</button>}
            </div>
          )}
        </div>

        {/* REPORTS */}
        <div className="menu">
          <button
            className={`menu-btn ${openMenu === "reports" ? "active" : ""}`}
            onClick={() => toggleMenu("reports")}
          >
            📊 Reports
          </button>

          {openMenu === "reports" && (
            <div className="menu-list">
              {can("stock_report") && <button onClick={() => handleNavigate("stock-report")}>Stock Report</button>}
              {can("stock_ledger") && <button onClick={() => handleNavigate("stock-ledger")}>Stock Ledger</button>}
              {can("sale_report") && <button onClick={() => handleNavigate("sale-report")}>Sales Profit Report</button>}
              {can("monthly_report") && <button onClick={() => handleNavigate("monthly-report")}>Monthly Graph Report</button>}
              {can("month_wise_summary") && <button onClick={() => handleNavigate("month-wise-summary")}>📦 Month Wise Summary</button>}
              {can("day_wise_sale_report") && <button onClick={() => handleNavigate("day-wise-sale-report")}>📅 Day Wise Sale Report</button>}
              {can("Rate_Difference_report") && <button onClick={() => handleNavigate("rate-difference-report")}>Rate Difference Report</button>}
              {can("deleted_invoice_report") && <button onClick={() => handleNavigate("deleted-invoice-report")}>🗑 Deleted Invoice Report</button>}
              {can("purchase_delete_report") && <button onClick={() => handleNavigate("purchase-delete-report")}>🗑 Deleted Purchase Report</button>}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="right-actions">
        <button
          className="logout-btn"
          style={{ marginRight: "10px", background: "#6f42c1" }}
          onClick={() => handleNavigate("restore")}
        >
          🔄 Restore
        </button>

        <div className="status">
          🟢 {user?.username || "User"} ({user?.role || "guest"})
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            sessionStorage.clear();
            localStorage.clear();
            onNavigate("login");
            window.location.reload();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
