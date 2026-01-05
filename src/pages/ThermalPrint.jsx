import React, { useEffect } from "react";

export default function ThermalPrint({ data, onClose }) {
  useEffect(() => {
    setTimeout(() => {
      window.print();
      onClose();
    }, 1000);
  }, [onClose]);

  if (!data) return null;

  const {
    invoiceNo,
    saleDate,
    customerName,
    customerPhone,
    entries,
    total,
  } = data;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        zIndex: 99999,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "20px",
      }}
    >
      <div
        style={{
          width: "80mm",
          background: "#fff",
          padding: "10px",
          border: "1px dashed #000",
          fontFamily: "monospace",
          fontSize: "12px",
        }}
      >
        {/* ===== SHOP HEADER ===== */}
        <div style={{ textAlign: "center", marginBottom: "5px" }}>
          <h2 style={{ margin: 0, fontSize: "16px" }}>
            💡 MADINA LIGHTS 💡
          </h2>

          <p style={{ margin: 0, fontSize: "11px" }}>
            Deal in all kinds of LED Lights, COB, BOB,
          </p>
          <p style={{ margin: 0, fontSize: "11px" }}>
            SKD, Drivers, PCB & Other Lights
          </p>

          <p style={{ margin: "4px 0 0", fontSize: "11px" }}>
            Shop No. G-24C, National Radio & TV Market
          </p>
          <p style={{ margin: 0, fontSize: "11px" }}>
            Below Hotel Green City, Saddar Karachi
          </p>

          <p style={{ margin: "3px 0 0", fontSize: "11px" }}>
            📞 0323-2698931
          </p>
        </div>

        <hr />

        {/* ===== INVOICE INFO ===== */}
        <div style={{ textAlign: "center" }}>
          <h4 style={{ margin: "5px 0" }}>🧾 SALES RECEIPT</h4>
          <p style={{ margin: 0 }}>Invoice No: {invoiceNo}</p>
          <p style={{ margin: 0 }}>Date: {saleDate}</p>
        </div>

        <hr />

        {/* ===== CUSTOMER INFO ===== */}
        <p style={{ margin: 0 }}>
          Customer:{" "}
          <strong>{customerName || "Walk-in Customer"}</strong>
        </p>
        <p style={{ margin: 0 }}>
          Phone: {customerPhone || "-"}
        </p>

        <hr />

        {/* ===== ITEMS TABLE ===== */}
        <table width="100%" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px dashed #000" }}>
              <th align="left">Item</th>
              <th align="right">Qty</th>
              <th align="right">Rate</th>
              <th align="right">Disc%</th>
              <th align="right">Amt</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i}>
                <td>{e.itemName}</td>
                <td align="right">{e.qty}</td>
                <td align="right">
                  {Number(e.saleRate).toFixed(2)}
                </td>
                <td align="right">{e.discount || 0}</td>
                <td align="right">
                  {Number(e.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        {/* ===== TOTAL ===== */}
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: "2px 0" }}>
            <strong>Total:</strong> Rs.{" "}
            {Number(total).toFixed(2)}
          </p>
        </div>

        <hr />

        {/* ===== FOOTER ===== */}
        <div style={{ textAlign: "center", fontSize: "11px" }}>
          <p style={{ margin: "5px 0" }}>
            Thank you for shopping with Madina Lights!
          </p>
        </div>
      </div>
    </div>
  );
}
