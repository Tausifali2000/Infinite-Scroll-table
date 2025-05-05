import axios from "axios";


const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/v1" : "/api/v1";


export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept:"application/json",
  }
});