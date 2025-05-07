import { useState, useEffect } from "react";
import { axiosInstance } from "../utils/axiosInstance.util.js";


export function usePaginatedUsers(page, limit) {
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [hasMore, setHasMore] = useState(true); 
  const [error, setError] = useState(null); 

  useEffect(() => {
   
    const fetchUsers = async () => {
      setLoading(true); 
      setError(null); 

      try {
        const response = await axiosInstance.get("/fetchUsers", {
          params: { page, limit },
        });
        
        setUsers((prev) => [...prev, ...response.data.users]); 
        if (page >= response.data.totalPages) {
          setHasMore(false); 
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users. Please try again later."); 
      } finally {
        setLoading(false); 
      }
    };

    fetchUsers();
  }, [page, limit]); 

  return { users, loading, hasMore, error }; 
}
