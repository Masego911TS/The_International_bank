import axiosInstance from "../utils/axiosConfig";

// Backend API URL (HTTPS with self-signed cert)
const API_URL = process.env.REACT_APP_AUTH_API_URL || "https://localhost:5000/api/auth";

// Register function
export const registerCustomer = async (fullName, idNumber, accountNumber, password) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/register`, {
      fullName,
      idNumber,
      accountNumber,
      password,
    });
    console.log("Registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Registration failed. Check console for details.");
    }
  }
};

// Login function
export const loginCustomer = async (fullName, accountNumber, password) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/login`, {
      fullName,
      accountNumber,
      password,
    });
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Login error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Login failed. Check console for details.");
    }
  }
};

// Logout function
export const logoutCustomer = async () => {
  try {
    const response = await axiosInstance.post(`${API_URL}/logout`);
    console.log("Logout response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Logout failed");
  }
};

// Refresh token function
export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post(`${API_URL}/refresh`);
    console.log("Token refreshed:", response.data);
    return response.data;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw new Error("Token refresh failed");
  }
};