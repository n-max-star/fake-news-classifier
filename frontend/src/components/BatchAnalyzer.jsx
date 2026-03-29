import React, { useState } from "react";
import { useBatch } from "../hooks/usePredict";

export default function BatchAnalyzer() {
  const [open, setOpen]   = useState(false);
  const [raw,  setRaw]    = useState("");
  const { results, loading, error, classifyBatch } = useBatch();

  const run = () => {
    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    // FIX: enforce 20-item cap client-side with a clear warning instead of silently truncating
    if (lines.length > 20) {
      alert("Max 20 headlines per batch. Please remove some lines and try again.");
      return;
    }
    classifyBatch(lines);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: "1px solid var(--border2)",
          color: "var(--muted)", borderRadius: 8, padding: "10px 20px",
          fontSize: 12, letterSpacing: "0.1em", fontFamily: "var(--font-mono)",
          display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent2)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--muted)"; }}
      >
        <span>⚡</span> BATCH ANALYSER
      </button>

      {open && (
        <div style={{ marginTop: 16, animation: "fadeUp 0.3s ease" }}>
          <div style={{ marginBottom: 8, fontSize: 12, color: "var(--muted)" }}>
            One headline per line (max 20):
          </div>
          <textarea
            value={raw}
            onChange={e => setRaw(e.target.value)}
            rows={6}
            placeholder={"BREAKING: Shocking truth revealed by whistleblower\nScientists discover new species in Amazon\nGovernment secretly microchipping citizens"}
            style={{
              width: "100%", background: "var(--surface)", border: "1px solid var(--border2)",
              borderRadius: 10, padding: "14px 16px", color: "var(--text)",
              fontFamily: "var(--font-mono)", fontSize: 13, resize: "vertical",
              outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border2)"}
          />
          <button
            onClick={run}
            disabled={loading || !raw.trim()}
            style={{
              marginTop: 10, padding: "10px 24px", background: "var(--accent)",
              border: "none", borderRadius: 8, color: "#fff",
              fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
              letterSpacing: "0.08em", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
            }}
          >
            {loading ? "Analysing…" : "RUN BATCH →"}
          </button>

          {error && (
            <div style={{ marginTop: 12, color: "#EF4444", fontSize: 12, padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>{error}</div>
          )}

          {results && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 4 }}>
                {results.results.length} RESULTS · {results.total_ms}ms
              </div>
              {results.results.map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "12px 16px",
                  borderLeft: `3px solid ${r.risk_color}`,
                }}>
                  <span style={{
                    fontWeight: 700, fontSize: 12, color: r.label === "FAKE" ? "#EF4444" : "#10B981",
                    fontFamily: "var(--font-mono)", minWidth: 44,
                  }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 48 }}>
                    {(r.confidence * 100).toFixed(1)}%
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text)", flex: 1 }}>{r.text}</span>
                  <span style={{
                    fontSize: 10, padding: "3px 8px", borderRadius: 4,
                    background: `${r.risk_color}18`, color: r.risk_color,
                    border: `1px solid ${r.risk_color}33`, letterSpacing: "0.08em", fontWeight: 600,
                  }}>
                    {r.risk_level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
