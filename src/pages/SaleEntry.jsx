// src/pages/SaleEntry.jsx

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import ThermalPrint from "./ThermalPrint";

export default function SaleEntry() {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [focusedField, setFocusedField] = useState("");

  // ================= CUSTOMER =================
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerList, setCustomerList] = useState([]);

  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // ================= ITEM =================
  const [barcode, setBarcode] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [saleRate, setSaleRate] = useState("");
  const [qty, setQty] = useState("");
  const [discount, setDiscount] = useState("");
  const [amount, setAmount] = useState(0);
  const [itemList, setItemList] = useState([]);

  const [itemSearch, setItemSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const [entries, setEntries] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [reprintInvoice, setReprintInvoice] = useState("");

  // ================= LOAD DATA =================
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("customers").select("*");
      setCustomerList(data || []);
    })();

    (async () => {
      const { data } = await supabase.from("items").select("*");
      setItemList(data || []);
    })();

    (async () => {
      const { data } = await supabase.from("sales").select("invoice_no");
      const unique = [
        ...new Set((data || []).map((d) => d.invoice_no).filter(Boolean)),
      ];
      setInvoiceNo(`INV-${unique.length + 1}`);
    })();
  }, []);

  // ================= AUTO LOOKUPS =================
  useEffect(() => {
    if (!customerCode) return;
    const c = customerList.find(
      (x) => String(x.customer_code) === String(customerCode)
    );
    if (c) {
      setCustomerName(c.customer_name);
      setCustomerSearch(c.customer_name);
      setCustomerAddress(c.address);
      setCustomerPhone(c.phone);
    }
  }, [customerCode, customerList]);

  useEffect(() => {
    if (!itemCode && !barcode) return;
    const i =
      itemList.find(
        (x) =>
          String(x.id) === String(itemCode) ||
          String(x.barcode) === String(barcode)
      ) || null;

    if (i) {
      setItemCode(i.id);
      setBarcode(i.barcode);
      setItemName(i.item_name);
      setItemSearch(i.item_name);
      setCategory(i.category);
      setDescription(i.description);
      setSaleRate(i.sale_price);
    }
  }, [itemCode, barcode, itemList]);

  // ================= AMOUNT =================
  useEffect(() => {
    const r = Number(saleRate || 0);
    const q = Number(qty || 0);
    const d = Number(discount || 0);
    const a = r * q - (r * q * d) / 100;
    setAmount(isNaN(a) ? 0 : a);
  }, [saleRate, qty, discount]);

  // ================= SEARCH =================
  useEffect(() => {
    if (!itemSearch) return setFilteredItems([]);
    setFilteredItems(
      itemList.filter((x) =>
        x.item_name.toLowerCase().includes(itemSearch.toLowerCase())
      )
    );
  }, [itemSearch, itemList]);

  useEffect(() => {
    if (!customerSearch) return setFilteredCustomers([]);
    setFilteredCustomers(
      customerList.filter((x) =>
        x.customer_name.toLowerCase().includes(customerSearch.toLowerCase())
      )
    );
  }, [customerSearch, customerList]);

  // ================= ADD ITEM =================
  const handleAdd = () => {
    if (!itemName || !qty) return alert("Item or Qty missing!");

    setEntries([
      ...entries,
      {
        itemCode,
        barcode,
        itemName,
        category,
        description,
        saleRate,
        qty,
        discount,
        amount,
      },
    ]);

    setItemCode("");
    setBarcode("");
    setItemName("");
    setItemSearch("");
    setCategory("");
    setDescription("");
    setSaleRate("");
    setQty("");
    setDiscount("");
    setAmount(0);

    setTimeout(() => document.getElementById("itemName").focus(), 80);
  };

  const handleRemove = (i) => {
    const x = [...entries];
    x.splice(i, 1);
    setEntries(x);
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!entries.length) return alert("No items!");

    const total = entries.reduce((s, e) => s + Number(e.amount || 0), 0);

    const rows = entries.map((e) => ({
      invoice_no: invoiceNo,
      sale_date: saleDate,
      customer_code: customerCode,
      customer_name: customerName,
      customer_address: customerAddress,
      customer_phone: customerPhone,
      item_code: e.itemCode,
      item_name: e.itemName,
      barcode: e.barcode,
      category: e.category,
      description: e.description,
      sale_rate: e.saleRate,
      qty: e.qty,
      discount: e.discount,
      amount: e.amount,
      total_amount: total,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("sales").insert(rows);
    if (error) return alert(error.message);

    for (const e of entries)
      await supabase.rpc("decrease_stock", {
        p_barcode: e.barcode,
        p_qty: e.qty,
      });

    setPrintData({
      invoiceNo,
      saleDate,
      customerName,
      customerPhone,
      entries,
      total,
      discount,
    });

    setEntries([]);

    const { data } = await supabase.from("sales").select("invoice_no");
    const unique = [
      ...new Set((data || []).map((d) => d.invoice_no).filter(Boolean)),
    ];
    setInvoiceNo(`INV-${unique.length + 1}`);

    setTimeout(() => document.getElementById("customerCode").focus(), 100);
  };

  // ================= UI =================
  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2 style={{ textAlign: "center" }}>Sale Entry</h2>

      {/* ================= ITEM ENTRY (ONE ROW) ================= */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "nowrap",
          border: "1px solid #ddd",
          padding: 10,
          borderRadius: 6,
          alignItems: "flex-end",
        }}
      >
        <div>
          <label>Item Code</label>
          <input value={itemCode} readOnly tabIndex={-1} />
        </div>

        <div>
          <label>Barcode</label>
          <input value={barcode} readOnly tabIndex={-1} />
        </div>

        {/* ITEM NAME */}
        <div style={{ position: "relative", minWidth: 220 }}>
          <label>Item Name</label>
          <input
            id="itemName"
            value={itemSearch}
            onChange={(e) => {
              setItemSearch(e.target.value);
              setShowItemDropdown(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                document.getElementById("qty").focus();
              }
            }}
            autoComplete="off"
          />

          {showItemDropdown && filteredItems.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "55px",
                left: 0,
                width: "100%",
                background: "#fff",
                border: "1px solid #ccc",
                zIndex: 999,
              }}
            >
              {filteredItems.map((it) => (
                <div
                  key={it.id}
                  style={{ padding: 6, cursor: "pointer" }}
                  onMouseDown={() => {
                    setItemCode(it.id);
                    setBarcode(it.barcode);
                    setItemName(it.item_name);
                    setItemSearch(it.item_name);
                    setCategory(it.category);
                    setDescription(it.description);
                    setSaleRate(it.sale_price);
                    setShowItemDropdown(false);
                    setTimeout(
                      () => document.getElementById("qty").focus(),
                      40
                    );
                  }}
                >
                  {it.item_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label>Category</label>
          <input value={category} readOnly tabIndex={-1} />
        </div>

        <div>
          <label>Description</label>
          <input value={description} readOnly tabIndex={-1} />
        </div>

        <div>
          <label>Rate</label>
          <input value={saleRate} readOnly tabIndex={-1} />
        </div>

        <div>
          <label>Qty</label>
          <input
            id="qty"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                document.getElementById("addItemBtn").focus();
              }
            }}
          />
        </div>

        <div>
          <label>Discount %</label>
          <input value={discount} readOnly tabIndex={-1} />
        </div>

        <div>
          <button
            id="addItemBtn"
            onClick={handleAdd}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          >
            Add Item
          </button>
        </div>
      </div>

      {/* ================= ITEMS TABLE ================= */}
      <table
        border="1"
        width="100%"
        style={{ marginTop: 10, borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th>#</th>
            <th>Item</th>
            <th>Rate</th>
            <th>Qty</th>
            <th>Disc%</th>
            <th>Amount</th>
            <th>❌</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{e.itemName}</td>
              <td>{e.saleRate}</td>
              <td>{e.qty}</td>
              <td>{e.discount}</td>
              <td>{e.amount.toFixed(2)}</td>
              <td>
                <button
                  onClick={() => handleRemove(i)}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ✖
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10, textAlign: "right" }}>
        <button onClick={handleSave}>💾 Save & Print</button>
      </div>

      {printData && (
        <ThermalPrint data={printData} onClose={() => setPrintData(null)} />
      )}
    </div>
  );
}
