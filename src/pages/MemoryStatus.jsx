import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function MemoryStatus({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);

    const { data: result, error } = await supabase.rpc("get_memory_status");

    if (error) {
      console.error(error);
      setData(null);
    } else {
      setData(result?.[0] || null);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="container-fluid py-3 text-white">
      <button
        onClick={() => onNavigate("dashboard")}
        className="btn btn-warning fw-bold mb-3"
      >
        ⬅ Exit
      </button>

      <h2 className="fw-bold text-warning">
        📊 Supabase Database Memory (500 MB)
      </h2>

      <div className="card bg-dark border-warning shadow mt-3 p-3">
        {loading ? (
          <p className="text-info">Loading memory status...</p>
        ) : data ? (
          <>
            <table className="table table-dark table-bordered mt-3">
              <tbody>
                <tr>
                  <th>Used Space</th>
                  <td>{data.used}</td>
                </tr>
                <tr>
                  <th>Remaining Space</th>
                  <td>{data.remaining}</td>
                </tr>
                <tr>
                  <th>Approx Rows Can Be Added</th>
                  <td className="text-success fw-bold">
                    {Number(data.approx_remaining_rows).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            <button
              className="btn btn-outline-warning fw-bold mt-2"
              onClick={loadStatus}
            >
              🔄 Refresh
            </button>
          </>
        ) : (
          <p className="text-danger">Failed to load memory data</p>
        )}
      </div>
    </div>
  );
}
