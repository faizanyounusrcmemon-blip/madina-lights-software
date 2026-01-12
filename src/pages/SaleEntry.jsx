import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import ThermalPrint from "./ThermalPrint";

export default function SaleEntry() {
  const [invoiceNo, setInvoiceNo] = useState("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  /* ================= CUSTOMER ================= */
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerList, setCustomerList] = useState([]);

  const [customerSearch, setCustomerSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  /* ================= ITEM ================= */
  const [itemList, setItemList] = useState([]);
  const [itemSearch, setItemSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [qty, setQty] = useState("");

  const [entries, setEntries] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [reprintInvoice, setReprintInvoice] = useState("");

  /* ================= LOAD DATA ================= */
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

  /* ================= CUSTOMER SEARCH ================= */
  useEffect(() => {
    if (!customerSearch) return setFilteredCustomers([]);
    setFilteredCustomers(
      customerList.filter((c) =>
        c.customer_name.toLowerCase().includes(customerSearch.toLowerCase())
      )
    );
  }, [customerSearch, customerList]);

  /* ================= ITEM SEARCH ================= */
  useEffect(() => {
    if (!itemSearch) return setFilteredItems([]);
    setFilteredItems(
      itemList.filter((i) =>
        i.item_name.toLowerCase().includes(itemSearch.toLowerCase())
      )
    );
  }, [itemSearch, itemList]);

  /* ================= ADD ITEM ================= */
  const handleAdd = () => {
    if (!selectedItem || !qty) return alert("Item or Qty missing!");

    const amount = Number(selectedItem.sale_price) * Number(qty);

    setEntries([
      ...entries,
      {
        item_code: selectedItem.id,
        barcode: selectedItem.barcode,
        item_name: selectedItem.item_name,
        sale_rate: selectedItem.sale_price,
        qty,
        amount,
      },
    ]);

    setItemSearch("");
    setSelectedItem(null);
    setQty("");
    setTimeout(() => document.getElementById("itemName").focus(), 50);
  };

  /* ================= REMOVE ================= */
  const handleRemove = (i) => {
    const copy = [...entries];
    copy.splice(i, 1);
    setEntries(copy);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!entries.length) return alert("No items!");

    const total = entries.reduce((s, e) => s + e.amount, 0);

    const rows = entries.map((e) => ({
      invoice_no: invoiceNo,
      sale_date: saleDate,
      customer_code: customerCode,
      customer_name: customerName,
      customer_address: customerAddress,
      customer_phone: customerPhone,
      item_code: e.item_code,
      item_name: e.item_name,
      barcode: e.barcode,
      sale_rate: e.sale_rate,
      qty: e.qty,
      amount: e.amount,
      total_amount: total,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("sales").insert(rows);
    if (error) return alert(error.message);

    for (const e of entries) {
      await supabase.rpc("decrease_stock", {
        p_barcode: e.barcode,
        p_qty: e.qty,
      });
    }

    setPrintData({
      invoiceNo,
      saleDate,
      customerName,
      customerPhone,
      entries,
      total,
    });

    setEntries([]);

    const { data } = await supabase.from("sales").select("invoice_no");
    const unique = [
      ...new Set((data || []).map((d) => d.invoice_no).filter(Boolean)),
    ];
    setInvoiceNo(`INV-${unique.length + 1}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 align="center">Sale Entry</h2>

      {/* CUSTOMER */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <input
          placeholder="Customer Code"
          value={customerCode}
          onChange={(e) => setCustomerCode(e.target.value)}
        />

        <div style={{ position: "relative" }}>
          <input
            placeholder="Customer Name"
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setShowCustomerDropdown(true);
            }}
          />
          {showCustomerDropdown && (
            <div style={{ position: "absolute", background: "#fff" }}>
              {filteredCustomers.map((c) => (
                <div
                  key={c.customer_code}
                  onMouseDown={() => {
                    setCustomerCode(c.customer_code);
                    setCustomerName(c.customer_name);
                    setCustomerSearch(c.customer_name);
                    setCustomerAddress(c.address);
                    setCustomerPhone(c.phone);
                    setShowCustomerDropdown(false);
                  }}
                >
                  {c.customer_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <input placeholder="Phone" value={customerPhone} readOnly />
      </div>

      {/* ================= ITEM ENTRY (ONE ROW – 3 FIELDS) ================= */}
      <div
        style={{
          display: "flex",
          gap: 10,
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 6,
        }}
      >
        {/* ITEM NAME */}
        <div style={{ position: "relative", flex: 2 }}>
          <input
            id="itemName"
            placeholder="Item Name"
            value={itemSearch}
            onChange={(e) => {
              setItemSearch(e.target.value);
              setShowItemDropdown(true);
            }}
          />
          {showItemDropdown && filteredItems.length > 0 && (
            <div style={{ position: "absolute", background: "#fff" }}>
              {filteredItems.map((i) => (
                <div
                  key={i.id}
                  onMouseDown={() => {
                    setSelectedItem(i);
                    setItemSearch(i.item_name);
                    setShowItemDropdown(false);
                    setTimeout(() => document.getElementById("qty").focus(), 50);
                  }}
                >
                  {i.item_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QTY */}
        <input
          id="qty"
          placeholder="Qty"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />

        {/* ADD */}
        <button onClick={handleAdd}>➕ Add Item</button>
      </div>

      {/* TABLE */}
      <table width="100%" border="1" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Rate</th>
            <th>Qty</th>
            <th>Amount</th>
            <th>❌</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{e.item_name}</td>
              <td>{e.sale_rate}</td>
              <td>{e.qty}</td>
              <td>{e.amount}</td>
              <td>
                <button onClick={() => handleRemove(i)}>✖</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div align="right" style={{ marginTop: 10 }}>
        <button onClick={handleSave}>💾 Save & Print</button>
      </div>

      {printData && (
        <ThermalPrint data={printData} onClose={() => setPrintData(null)} />
      )}
    </div>
  );
}
