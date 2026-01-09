"use client";

import { useEffect, useState } from "react";

type Reading = {
  id: number;
  ts: string;
  device_id: string;
  metrics: Record<string, any>;
};

export default function Home() {
  const [items, setItems] = useState<Reading[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await fetch("/api/readings/latest?device_code=RPI5-01");
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error ?? "Failed");
      return;
    }
    setItems(data.items);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // 5초마다 갱신(전시용으로 충분)
    return () => clearInterval(t);
  }, []);

  const latest = items[0];

  return (
    <main style={{ padding: 20 }}>
      <h1>IoT Dashboard (Latest Readings)</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={load}>Refresh</button>

      {latest && (
        <section style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div style={{ border: "1px solid #ddd", padding: 12, width: 220 }}>
            <div>Temp</div>
            <b>{latest.metrics?.temp_c ?? "--"} °C</b>
          </div>
          <div style={{ border: "1px solid #ddd", padding: 12, width: 220 }}>
            <div>Humidity</div>
            <b>{latest.metrics?.hum_percent ?? "--"} %</b>
          </div>
          <div style={{ border: "1px solid #ddd", padding: 12, width: 220 }}>
            <div>Distance</div>
            <b>{latest.metrics?.distance_cm ?? "--"} cm</b>
          </div>
        </section>
      )}      

      <table border={1} cellPadding={8} style={{ marginTop: 12, width: "100%" }}>
        <thead>
          <tr>
            <th>ts</th>
            <th>device</th>
            <th>metrics</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.ts).toLocaleString()}</td>
              <td>{r.device_id}</td>
              <td><pre style={{ margin: 0 }}>{JSON.stringify(r.metrics, null, 2)}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
