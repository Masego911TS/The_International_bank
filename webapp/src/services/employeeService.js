import axiosInstance from "../utils/axiosConfig";

const API_URL = process.env.REACT_APP_API_URL || "https://localhost:5000/api/employees";

// Employee login function with detailed error logging
export const loginEmployee = async (username, password) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/login`, { 
      username, 
      password 
    });
    console.log("Employee login response:", response.data);
    return response.data; // { token: "..."}
  } catch (error) {
    console.error("Employee login error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Throw a clear error message for frontend
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Login failed. Check console for details.");
    }
  }
};

// Employee logout function
export const logoutEmployee = async () => {
  try {
    const response = await axiosInstance.post(`${API_URL}/logout`);
    console.log("Employee logout response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Employee logout error:", error);
    throw new Error("Logout failed");
  }
};