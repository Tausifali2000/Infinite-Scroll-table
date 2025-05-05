// hooks/usePaginatedUsers.hook.js
import { axiosInstance } from "../utils/axiosInstance.util.js";

export async function usePaginatedUsers(page, limit) {
  try {
    const response = await axiosInstance.get("/fetchUsers", {
      params: { page, limit },
    });
    return {
      users: response.data.users,
      totalPages: response.data.totalPages,
    };
  } catch (err) {
    console.error("Failed to fetch users:", err);
    throw err;
  }
}
