import axios from "axios";


const BASE_URL = "https://infinite-scroll-table.onrender.com/api/v1"


export const axiosInstance = axios.create({
  baseURL: BASE_URL || "https://infinite-scroll-table.onrender.com/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept:"application/json",
  }
});