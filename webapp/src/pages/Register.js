import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerCustomer } from "../services/authService";
import { authContext } from "../context/authContext";
import { employeeContext } from "../context/employeeContext";
import "./Register.css";

function Register() {
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { isAuthenticated, isLoading: customerLoading } = useContext(authContext);
  const { isEmployeeAuthenticated, isLoading: employeeLoading } = useContext(employeeContext);

  // Redirect if already logged in as customer or employee
  useEffect(() => {
    if (customerLoading || employeeLoading) return; // Wait for loading to finish
    
    if (isAuthenticated) {
      navigate("/dashboard");
    } else if (isEmployeeAuthenticated) {
      navigate("/employee-portal");
    }
  }, [isAuthenticated, isEmployeeAuthenticated, customerLoading, employeeLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Register customer, but do NOT store token
      await registerCustomer(fullName, idNumber, accountNumber, password);

      // Clear fields
      setFullName("");
      setIdNumber("");
      setAccountNumber("");
      setPassword("");

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  // Show loading state
  if (customerLoading || employeeLoading) {
    return <div className="register-container"><p>Loading...</p></div>;
  }

  return (
    <div className="register-container">
      <h2>Customer Registration</h2>
      {error && <p className="error-message">{error}</p>}
      <form className="register-form" onSubmit={handleSubmit}>
        <label>Full Name:</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={isEmployeeAuthenticated}
        />

        <label>SA ID Number:</label>
        <input
          type="text"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          required
          disabled={isEmployeeAuthenticated}
        />

        <label>Account Number:</label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
          disabled={isEmployeeAuthenticated}
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isEmployeeAuthenticated}
        />

        <button type="submit" disabled={isEmployeeAuthenticated}>
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;