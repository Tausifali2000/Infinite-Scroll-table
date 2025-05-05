import axios from "axios";


const BASE_URL = "http://localhost:5000/api/v1"


export const axiosInstance = axios.create({
  baseURL: BASE_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept:"application/json",
  }
});