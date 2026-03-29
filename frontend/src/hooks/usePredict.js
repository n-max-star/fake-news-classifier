import { useState, useCallback, useRef } from "react";
import { predictOne, predictBatch } from "../services/api";

// Normalise FastAPI error detail — it can be a string OR an array of validation objects
function extractDetail(e) {
  const detail = e?.response?.data?.detail;
  if (!detail) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(d => d.msg || JSON.stringify(d)).join("; ");
  return JSON.stringify(detail);
}

export function usePredict() {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  // FIX: track abort controller so in-flight requests can be cancelled on reset/unmount
  const controllerRef = useRef(null);

  const classify = useCallback(async (text) => {
    // Cancel any previous in-flight request
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await predictOne(text, controllerRef.current.signal);
      setResult(data);
    } catch (e) {
      if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return; // aborted — suppress
      setError(extractDetail(e) || "Failed to reach API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    // FIX: abort in-flight request when user resets
    if (controllerRef.current) { controllerRef.current.abort(); controllerRef.current = null; }
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { result, loading, error, classify, reset };
}

export function useBatch() {
  const [results, setResults]  = useState(null);
  const [loading, setLoading]  = useState(false);
  const [error,   setError]    = useState(null);

  const classifyBatch = useCallback(async (texts) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await predictBatch(texts);
      setResults(data);
    } catch (e) {
      // FIX: use same normalised detail extraction
      setError(extractDetail(e) || "Batch request failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, classifyBatch };
}

