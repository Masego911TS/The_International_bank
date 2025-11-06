import axiosInstance from "../utils/axiosConfig";

const API_URL = process.env.REACT_APP_PAYMENTS_API_URL || "https://localhost:5000/api/payments";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Submit a payment
export const submitPayment = async ({ amount, currency, payeeAccount, swiftCode }) => {
  try {
    const token = localStorage.getItem("customerToken");
    if (!token) throw new Error("No authentication token found");

    const response = await axiosInstance.post(
      `${API_URL}/make-payment`,
      { amount, currency, payeeAccount, swiftCode, provider: "SWIFT" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Payment submission error:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch payments for the logged-in customer
export const getCustomerPayments = async (token) => {
  try {
    if (!token) throw new Error("No authentication token found");

    const response = await axiosInstance.get(`${API_URL}/customer-payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching customer payments:", error.response?.data || error.message);
    throw error;
  }
};