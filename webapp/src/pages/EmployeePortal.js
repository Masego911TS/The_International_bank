import { useEffect, useState, useContext } from "react";
import axiosInstance from "../utils/axiosConfig";
import { employeeContext } from "../context/employeeContext";
import { useNavigate } from "react-router-dom";
import "./EmployeePortal.css";

function EmployeePortal() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { logoutEmployee } = useContext(employeeContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("employeeToken");
  const EMPLOYEES_API_URL = process.env.REACT_APP_EMPLOYEES_API_URL;

  // Fetch pending payments
  const fetchPayments = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await axiosInstance.get(`${EMPLOYEES_API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Add local 'verified' flag for UI toggle
      const paymentsWithVerifiedFlag = response.data.map((p) => ({
        ...p,
        verified: false,
      }));

      setPayments(paymentsWithVerifiedFlag);
    } catch (error) {
      console.error(
        "Error fetching payments:",
        error.response?.data || error.message
      );
      setErrorMessage("Failed to load payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Toggle verification locally
  const handleVerify = (id) => {
    setPayments(
      payments.map((p) => (p._id === id ? { ...p, verified: !p.verified } : p))
    );
  };

  // Submit verified payments to backend
  const handleSubmitSWIFT = async () => {
    const verifiedPayments = payments.filter((p) => p.verified);
    if (verifiedPayments.length === 0) {
      alert("No verified payments to submit!");
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await axiosInstance.post(
        `${EMPLOYEES_API_URL}/submit-swift`,
        { transactions: verifiedPayments.map((p) => p._id) },
        { 
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("SWIFT submission response:", response.data);
      setSuccessMessage("Verified payments submitted to SWIFT successfully!");

      // Refresh payments list
      fetchPayments();
    } catch (error) {
      console.error(
        "Error submitting to SWIFT:",
        error.response?.data || error.message
      );
      setErrorMessage("Failed to submit payments to SWIFT.");
    }
  };

  if (loading) return <p>Loading payments...</p>;

  return (
    <div className="employee-portal-container">
      <div className="employee-portal-header">
        <h2>Employee Dashboard / SWIFT Portal</h2>
      </div>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <table className="transaction-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Customer Name</th>
            <th>Customer ID Number</th>
            <th>Account</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>SWIFT</th>
            <th>Status</th>
            <th>Verify</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, index) => (
            <tr key={p._id}>
              <td>{index + 1}</td>
              <td>{p.customerId?.fullName || "N/A"}</td>
              <td>{p.customerId?.idNumber || "N/A"}</td>
              <td>{p.payeeAccount}</td>
              <td>{p.amount}</td>
              <td>{p.currency}</td>
              <td>{p.swiftCode}</td>
              <td>{p.status}</td>
              <td>
                <button onClick={() => handleVerify(p._id)}>
                  {p.verified ? "Unverify" : "Verify"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="submit-swift-btn" onClick={handleSubmitSWIFT}>
        Submit to SWIFT
      </button>
    </div>
  );
}

export default EmployeePortal;