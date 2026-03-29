import React, { useEffect, useRef } from "react";

const riskMeta = {
  LOW:      { color: "#10B981", label: "LOW RISK",      bg: "rgba(16,185,129,0.08)"  },
  MEDIUM:   { color: "#F59E0B", label: "MEDIUM RISK",   bg: "rgba(245,158,11,0.08)"  },
  HIGH:     { color: "#F97316", label: "HIGH RISK",     bg: "rgba(249,115,22,0.08)"  },
  CRITICAL: { color: "#EF4444", label: "CRITICAL RISK", bg: "rgba(239,68,68,0.08)"   },
};

// FIX: bar starts at width:0 and animates to the target value via useEffect,
// so the CSS transition actually fires (setting final width on initial render skips it).
function GaugeBar({ value, color }) {
  const fillRef = useRef(null);
  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    // Reset to 0 first (covers re-renders with new results)
    el.style.width = "0%";
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => { el.style.width = `${value * 100}%`; });
    });
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div style={{ position: "relative", height: 8, background: "#1E2840", borderRadius: 4, overflow: "hidden" }}>
      <div
        ref={fillRef}
        style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: "0%", background: color, borderRadius: 4,
          transition: "width 0.9s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </div>
  );
}

function TokenBadge({ token, direction }) {
  const isFake = direction === "fake";
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 4, fontSize: 11,
      fontFamily: "var(--font-mono)", fontWeight: 500, margin: "3px 4px 3px 0",
      background: isFake ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
      color: isFake ? "#EF4444" : "#10B981",
      border: `1px solid ${isFake ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}`,
    }}>
      {isFake ? "−" : "+"} {token}
    </span>
  );
}

export default function ResultCard({ result }) {
  if (!result) return null;
  const isFake = result.label === "FAKE";
  const rm     = riskMeta[result.risk_level] || riskMeta.LOW;
  const mainColor = isFake ? "#EF4444" : "#10B981";

  return (
    <div style={{
      animation: "fadeUp 0.4s ease both",
      border: `1px solid ${mainColor}33`,
      borderRadius: 16, overflow: "hidden",
      background: "var(--surface2)",
    }}>
      {/* Header verdict */}
      <div style={{
        padding: "28px 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 16,
        background: isFake ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.06)",
        borderBottom: `1px solid ${mainColor}22`,
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 8, fontWeight: 500 }}>
            VERDICT
          </div>
          <div style={{
            fontFamily: "var(--font-head)", fontWeight: 800,
            fontSize: "clamp(28px, 5vw, 42px)", color: mainColor, lineHeight: 1,
          }}>
            {result.label}
          </div>
        </div>

        {/* Circular confidence */}
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <svg width={90} height={90} viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="38" fill="none" stroke="#1E2840" strokeWidth="7" />
            <circle
              cx="45" cy="45" r="38" fill="none"
              stroke={mainColor} strokeWidth="7"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - result.confidence)}`}
              strokeLinecap="round"
              transform="rotate(-90 45 45)"
              style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
            <text x="45" y="45" textAnchor="middle" dominantBaseline="central"
              fill={mainColor} fontSize="16" fontWeight="700" fontFamily="DM Mono, monospace">
              {Math.round(result.confidence * 100)}%
            </text>
          </svg>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, letterSpacing: "0.1em" }}>
            CONFIDENCE
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Risk badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: rm.bg, border: `1px solid ${rm.color}33`,
          borderRadius: 8, padding: "8px 16px", alignSelf: "flex-start",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: rm.color, animation: "pulse-ring 2s infinite" }} />
          <span style={{ fontWeight: 600, fontSize: 13, color: rm.color, letterSpacing: "0.1em" }}>{rm.label}</span>
        </div>

        {/* Probability bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--muted)", fontWeight: 500 }}>PROBABILITY BREAKDOWN</div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: "#EF4444" }}>FAKE</span>
              <span style={{ color: "#EF4444", fontWeight: 600 }}>{(result.fake_probability * 100).toFixed(1)}%</span>
            </div>
            <GaugeBar value={result.fake_probability} color="#EF4444" />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: "#10B981" }}>REAL</span>
              <span style={{ color: "#10B981", fontWeight: 600 }}>{(result.real_probability * 100).toFixed(1)}%</span>
            </div>
            <GaugeBar value={result.real_probability} color="#10B981" />
          </div>
        </div>

        {/* Token weights */}
        {result.top_tokens && result.top_tokens.length > 0 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--muted)", fontWeight: 500, marginBottom: 12 }}>
              INFLUENTIAL TOKENS
            </div>
            <div>
              {result.top_tokens.map((t, i) => (
                <TokenBadge key={i} token={t.token} direction={t.direction} />
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
          padding: "16px", background: "var(--surface)", borderRadius: 10,
          border: "1px solid var(--border)", fontSize: 12,
        }}>
          <div>
            <div style={{ color: "var(--muted)", marginBottom: 4, letterSpacing: "0.1em" }}>INFERENCE TIME</div>
            <div style={{ color: "var(--accent2)", fontWeight: 600 }}>{result.inference_ms} ms</div>
          </div>
          <div>
            <div style={{ color: "var(--muted)", marginBottom: 4, letterSpacing: "0.1em" }}>TOKENS ANALYSED</div>
            <div style={{ color: "var(--accent2)", fontWeight: 600 }}>{result.top_tokens?.length || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
