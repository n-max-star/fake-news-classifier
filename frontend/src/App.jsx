import React, { useState, useEffect, useRef } from "react";
import ResultCard from "./components/ResultCard";
import ModelStats from "./components/ModelStats";
import BatchAnalyzer from "./components/BatchAnalyzer";
import { usePredict } from "./hooks/usePredict";
import { getExamples, getHealth } from "./services/api";
import "./index.css";

/* ── Scanline bg decoration ─────────────────────────────────── */
function Grid() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
      backgroundImage: `
        linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "48px 48px",
    }} />
  );
}

/* ── API Status dot ─────────────────────────────────────────── */
function StatusDot() {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    getHealth().then(() => setOk(true)).catch(() => setOk(false));
  }, []);
  const color = ok === null ? "#5A6A8A" : ok ? "#10B981" : "#EF4444";
  const label = ok === null ? "CHECKING" : ok ? "API ONLINE" : "API OFFLINE";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em" }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
      {label}
    </div>
  );
}

/* ── Example pill ───────────────────────────────────────────── */
function ExamplePill({ text, onUse }) {
  return (
    <button
      onClick={() => onUse(text)}
      style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "8px 14px", fontSize: 12,
        color: "var(--muted)", fontFamily: "var(--font-mono)",
        cursor: "pointer", textAlign: "left", transition: "all 0.2s",
        lineHeight: 1.4,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
    >
      {text}
    </button>
  );
}

/* ── Main App ───────────────────────────────────────────────── */
export default function App() {
  const [text, setText]           = useState("");
  const [examples, setExamples]   = useState(null);
  const textareaRef               = useRef(null);
  const { result, loading, error, classify, reset } = usePredict();

  useEffect(() => {
    getExamples().then(setExamples).catch(() => {});
  }, []);

  const handleSubmit = () => {
    if (!text.trim()) return;
    classify(text.trim());
  };

  const useExample = (t) => {
    setText(t);
    reset();
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <Grid />

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--border)",
        background: "rgba(7,11,20,0.85)", backdropFilter: "blur(12px)",
        padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366F1, #818CF8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700,
          }}>⚠</div>
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--text)", letterSpacing: "0.05em" }}>
              VERIDECT
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em" }}>FAKE NEWS CLASSIFIER</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <StatusDot />
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.08em", fontFamily: "var(--font-mono)",
                     padding: "6px 14px", border: "1px solid var(--border)", borderRadius: 6,
                     transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent2)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
          >
            API DOCS ↗
          </a>
        </div>
      </nav>

      {/* ── Main content ──────────────────────────────────────── */}
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 52, animation: "fadeUp 0.5s ease" }}>
          <div style={{
            display: "inline-block", fontSize: 11, letterSpacing: "0.2em",
            color: "var(--accent2)", background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20,
            padding: "5px 16px", marginBottom: 20, fontWeight: 500,
          }}>
            LOGISTIC REGRESSION · TF-IDF · FAKENEWSNET
          </div>
          <h1 style={{
            fontFamily: "var(--font-head)", fontWeight: 800,
            fontSize: "clamp(34px, 6vw, 58px)", lineHeight: 1.08,
            color: "var(--text)", marginBottom: 18, letterSpacing: "-0.02em",
          }}>
            Detect Fake News<br />
            <span style={{ color: "var(--accent2)" }}>Instantly.</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7, maxWidth: 540, margin: "0 auto" }}>
            Paste a headline or article excerpt. The model predicts whether it's real or fake,
            shows confidence, risk level, and which words drove the decision.
          </p>
        </div>

        {/* Input card */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border2)",
          borderRadius: 18, padding: 28, marginBottom: 24,
          animation: "fadeUp 0.5s 0.1s ease both",
        }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--muted)", marginBottom: 12, fontWeight: 500 }}>
            PASTE HEADLINE OR TEXT
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => { setText(e.target.value); if (result) reset(); }}
            onKeyDown={handleKey}
            rows={4}
            placeholder="e.g. BREAKING: Scientists discover that the moon is made of cheese..."
            style={{
              width: "100%", background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "16px 18px", color: "var(--text)",
              fontFamily: "var(--font-mono)", fontSize: 14, resize: "vertical",
              outline: "none", lineHeight: 1.6, transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />

          {/* Actions row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {text.length > 0 ? `${text.length} characters` : "Ctrl+Enter to classify"}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {text && (
                <button
                  onClick={() => { setText(""); reset(); }}
                  style={{
                    background: "none", border: "1px solid var(--border)",
                    color: "var(--muted)", borderRadius: 8, padding: "10px 18px",
                    fontFamily: "var(--font-mono)", fontSize: 13, cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#EF4444"; e.currentTarget.style.color = "#EF4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
                >
                  CLEAR
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading || !text.trim()}
                style={{
                  background: loading ? "var(--surface2)" : "var(--accent)",
                  border: "none", borderRadius: 8, padding: "10px 28px",
                  color: loading ? "var(--muted)" : "#fff",
                  fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
                  letterSpacing: "0.08em", cursor: loading || !text.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {loading && (
                  <span style={{
                    width: 14, height: 14, border: "2px solid var(--muted)",
                    borderTopColor: "var(--accent2)", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.7s linear infinite",
                  }} />
                )}
                {loading ? "ANALYSING…" : "ANALYSE →"}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "14px 20px", background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12,
            color: "#EF4444", fontSize: 13, marginBottom: 24,
            animation: "fadeUp 0.3s ease",
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Result */}
        {result && <div style={{ marginBottom: 24 }}><ResultCard result={result} /></div>}

        {/* Examples */}
        {examples && (
          <div style={{ animation: "fadeUp 0.5s 0.2s ease both" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--muted)", fontWeight: 500, marginBottom: 14 }}>
              TRY AN EXAMPLE
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "#EF4444", marginBottom: 8, letterSpacing: "0.1em" }}>▼ LIKELY FAKE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {examples.fake_examples.map((t, i) => (
                    <ExamplePill key={i} text={t} onUse={useExample} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#10B981", marginBottom: 8, letterSpacing: "0.1em" }}>▲ LIKELY REAL</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {examples.real_examples.map((t, i) => (
                    <ExamplePill key={i} text={t} onUse={useExample} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batch + Model stats */}
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 0, animation: "fadeUp 0.5s 0.3s ease both" }}>
          <BatchAnalyzer />
          <ModelStats />
        </div>

        {/* Footer */}
        <div style={{ marginTop: 60, textAlign: "center", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", lineHeight: 2 }}>
          VERIDECT · Logistic Regression on FakeNewsNet (GossipCop + PolitiFact)<br />
          Test Accuracy 81.4% · ROC-AUC 87.1% · 5-Fold CV 86.0%
        </div>
      </main>
    </div>
  );
}
