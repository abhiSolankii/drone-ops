import { useState } from "react";
import axios from "../config/axiosConfig.js";

/**
 * Generic hook for API requests with loading and error states.
 * @returns {object} - { apiRequest, loading, error }
 */
const useApiRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiRequest = async (method, path, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios({
        method: method,
        url: path,
        data:
          method === "POST" || method === "PUT" || method === "PATCH"
            ? data
            : null,
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Unknown error";
      setError(errorMessage);
      console.error(`Error during ${method} request to ${path}:`, errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { apiRequest, loading, error };
};

export default useApiRequest;
