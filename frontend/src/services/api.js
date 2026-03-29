import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
// FIX: 10 s was too short for a cold-starting model — raised to 20 s
const api  = axios.create({ baseURL: BASE, timeout: 20000 });

// FIX: accept an AbortSignal so callers can cancel in-flight requests
export const predictOne = (text, signal) =>
  api.post("/predict", { text }, { signal }).then((r) => r.data);

export const predictBatch = (texts) =>
  api.post("/batch", { texts }).then((r) => r.data);

export const getModelInfo = () =>
  api.get("/model/info").then((r) => r.data);

export const getExamples = () =>
  api.get("/examples").then((r) => r.data);

export const getHealth = () =>
  api.get("/health").then((r) => r.data);
