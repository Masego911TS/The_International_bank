import { useState, useEffect } from "react";
import "./CustomerDashboard.css";
import { submitPayment, getCustomerPayments } from "../services/paymentService";

function CustomerDashboard() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [payeeAccount, setPayeeAccount] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch customer payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("customerToken");
      const data = await getCustomerPayments(token);
      setPayments(data);
    } catch (error) {
      console.error("Error fetching customer payments:", error);
      setErrorMessage("Failed to load your payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Submit payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await submitPayment({
        amount,
        currency,
        payeeAccount,
        swiftCode,
      });
      setSuccessMessage(response.message || "Payment submitted successfully!");
      setAmount("");
      setCurrency("USD");
      setPayeeAccount("");
      setSwiftCode("");

      // Refresh payments table
      fetchPayments();
    } catch (error) {
      console.error("Payment error:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.message || "Payment failed. Please try again."
      );
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Customer Dashboard</h2>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Payment Form */}
      <form className="payment-form" onSubmit={handleSubmit}>
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <label>Currency:</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="USD">USD</option>
          <option value="ZAR">ZAR</option>
          <option value="EUR">EUR</option>
        </select>

        <label>Payee Account Number:</label>
        <input
          type="text"
          value={payeeAccount}
          onChange={(e) => setPayeeAccount(e.target.value)}
          required
        />

        <label>SWIFT Code:</label>
        <input
          type="text"
          value={swiftCode}
          onChange={(e) => setSwiftCode(e.target.value)}
          required
        />

        <button type="submit">Pay Now</button>
      </form>

      {/* Payments Table */}
      <div className="payments-table-container">
        <h3>Your Payments</h3>
        {loading ? (
          <p>Loading your payments...</p>
        ) : payments.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>SWIFT</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, index) => (
                  <tr key={p._id}>
                    <td>{index + 1}</td>
                    <td>{p.payeeAccount}</td>
                    <td>{p.amount}</td>
                    <td>{p.currency}</td>
                    <td>{p.swiftCode}</td>
                    <td>{p.status}</td>
                    <td>{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;
