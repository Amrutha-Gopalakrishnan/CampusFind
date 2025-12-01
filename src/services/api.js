import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // your FastAPI backend
});

// POST new item to backend
export const uploadItem = (data) => API.post("/predict", data);

// GET past analysis data
export const getPastAnalysis = () => API.get("/past-analysis");

export default API;
