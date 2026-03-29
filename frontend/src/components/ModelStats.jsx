import React, { useEffect, useState } from "react";
import { getModelInfo } from "../services/api";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

function StatBox({ label, value, color = "var(--accent2)" }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "18px 20px",
    }}>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--muted)", marginBottom: 8, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>
        {value}
      </div>
    </div>
  );
}

export default function ModelStats() {
  const [info, setInfo]       = useState(null);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !info) {
      setLoading(true);
      getModelInfo().then(setInfo).catch(() => {}).finally(() => setLoading(false));
    }
  }, [open, info]);

  // FIX: removed hardcoded fabricated Precision (83) and Recall (81) values —
  // these are not returned by the API and were invented, which is misleading.
  const radarData = info ? [
    { metric: "Accuracy", value: info.test_accuracy * 100 },
    { metric: "ROC-AUC",  value: info.test_roc_auc  * 100 },
    { metric: "CV AUC",   value: info.cv_auc_mean    * 100 },
  ] : [];

  return (
    <div style={{ marginTop: 32 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: "1px solid var(--border2)",
          color: "var(--muted)", borderRadius: 8, padding: "10px 20px",
          fontSize: 12, letterSpacing: "0.1em", fontFamily: "var(--font-mono)",
          display: "flex", alignItems: "center", gap: 8,
          transition: "all 0.2s", cursor: "pointer",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent2)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--muted)"; }}
      >
        <span style={{ fontSize: 14 }}>{open ? "▲" : "▼"}</span>
        MODEL PERFORMANCE STATS
      </button>

      {open && (
        <div style={{ marginTop: 16, animation: "fadeUp 0.3s ease", display: "flex", flexDirection: "column", gap: 20 }}>
          {loading && (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: 16 }}>Loading model info…</div>
          )}

          {info && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                <StatBox label="TEST ACCURACY"  value={`${(info.test_accuracy * 100).toFixed(2)}%`}  color="#818CF8" />
                <StatBox label="TEST ROC-AUC"   value={info.test_roc_auc.toFixed(4)}                 color="#10B981" />
                <StatBox label="CV AUC MEAN"    value={info.cv_auc_mean.toFixed(4)}                  color="#F59E0B" />
                <StatBox label="TRAIN SAMPLES"  value={info.train_size.toLocaleString()}             color="#94A3B8" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--muted)", marginBottom: 12 }}>METRIC RADAR</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#1E2840" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: "#5A6A8A", fontSize: 11 }} />
                      <Radar dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--muted)" }}>TOP SIGNAL WORDS</div>
                  <div>
                    <div style={{ fontSize: 11, color: "#EF4444", marginBottom: 6, letterSpacing: "0.08em" }}>▼ FAKE INDICATORS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {info.top_fake_words?.slice(0,8).map(([w]) => (
                        <span key={w} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>{w}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#10B981", marginBottom: 6, letterSpacing: "0.08em" }}>▲ REAL INDICATORS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {info.top_real_words?.slice(0,8).map(([w]) => (
                        <span key={w} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}>{w}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: "var(--muted)", padding: "12px 16px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}>
                <strong style={{ color: "var(--accent2)" }}>Model:</strong> {info.model_name}
                &nbsp;·&nbsp; <strong style={{ color: "var(--accent2)" }}>Class Weight (fake):</strong> {info.class_weights?.["0"]?.toFixed(4)}
                &nbsp;·&nbsp; <strong style={{ color: "var(--accent2)" }}>Class Weight (real):</strong> {info.class_weights?.["1"]?.toFixed(4)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
