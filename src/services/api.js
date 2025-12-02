import axios from "axios";

const API = axios.create({
  baseURL: "https://campusfind-1q4s.onrender.com", // your FastAPI backend
});

// POST new item to backend
export const uploadItem = (data) => API.post("/predict", data);

// GET past analysis data
export const getPastAnalysis = () => API.get("/past-analysis");

export default API;
