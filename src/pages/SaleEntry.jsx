// src/pages/SaleEntry.jsx

import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import ThermalPrint from "./ThermalPrint";

export default function SaleEntry() {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
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
    supabase.from("customers").select("*").then(({ data }) => {
      setCustomerList(data || []);
    });

    supabase.from("items").select("*").then(({ data }) => {
      setItemList(data || []);
    });

    supabase.from("sales").select("invoice_no").then(({ data }) => {
      const unique = [
        ...new Set((data || []).map((d) => d.invoice_no).filter(Boolean)),
      ];
      setInvoiceNo(`INV-${unique.length + 1}`);
    });
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
    const a =
      Number(saleRate || 0) * Number(qty || 0) -
      (Number(saleRate || 0) * Number(qty || 0) * Number(discount || 0)) / 100;
    setAmount(isNaN(a) ? 0 : a);
  }, [saleRate, qty, discount]);

  // ================= SEARCH =================
  useEffect(() => {
    setFilteredItems(
      itemSearch
        ? itemList.filter((x) =>
            x.item_name.toLowerCase().includes(itemSearch.toLowerCase())
          )
        : []
    );
  }, [itemSearch, itemList]);

  useEffect(() => {
    setFilteredCustomers(
      customerSearch
        ? customerList.filter((x) =>
            x.customer_name.toLowerCase().includes(customerSearch.toLowerCase())
          )
        : []
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

    setTimeout(() => document.getElementById("itemCode").focus(), 80);
  };

  const handleRemove = (i) => {
    const x = [...entries];
    x.splice(i, 1);
    setEntries(x);
  };

  // ================= UI =================
  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2 style={{ textAlign: "center" }}>Sale Entry</h2>

      {/* ================= CUSTOMER INFO (UNCHANGED) ================= */}
      {/* 🔴 EXACT SAME AS YOUR OLD CODE – NOT TOUCHED */}

      {/* ================= ITEM ENTRY HEADER ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "60px 100px 220px 120px 180px 90px 70px 90px 100px",
          gap: 8,
          background: "#f1f1f1",
          padding: 6,
          fontWeight: "bold",
          border: "1px solid #ccc",
          marginTop: 10,
        }}
      >
        <div>Code</div>
        <div>Barcode</div>
        <div>Item</div>
        <div>Category</div>
        <div>Description</div>
        <div>Rate</div>
        <div>Qty</div>
        <div>Disc%</div>
        <div></div>
      </div>

      {/* ================= ITEM ENTRY ================= */}
      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "60px 100px 220px 120px 180px 90px 70px 90px 100px",
            gap: 8,
            border: "1px solid #ddd",
            padding: 8,
          }}
        >
          <input id="itemCode" value={itemCode} onChange={(e) => setItemCode(e.target.value)} />
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          <input value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} />
          <input value={category} readOnly />
          <input value={description} readOnly />
          <input value={saleRate} readOnly />
          <input value={qty} onChange={(e) => setQty(e.target.value)} />
          <input value={discount} readOnly />
          <button onClick={handleAdd}>Add</button>
        </div>
      </div>

      {/* ================= ITEMS TABLE (UNCHANGED) ================= */}
      {/* SAME AS YOUR OLD CODE */}

      {printData && (
        <ThermalPrint data={printData} onClose={() => setPrintData(null)} />
      )}
    </div>
  );
}
