import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginCustomer as loginCustomerService } from "../services/authService";
import { authContext } from "../context/authContext";
import { employeeContext } from "../context/employeeContext";
import "./Login.css";

function Login() {
  const [fullName, setFullName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { loginCustomer, isAuthenticated, isLoading: customerLoading } = useContext(authContext);
  const { isEmployeeAuthenticated, isLoading: employeeLoading } = useContext(employeeContext);
  const navigate = useNavigate();

  // Redirect if already logged in
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

    // Prevent customer login if employee session exists
    if (isEmployeeAuthenticated) {
      setError(
        "You are currently logged in as an employee. Please log out first."
      );
      return;
    }

    try {
      const data = await loginCustomerService(
        fullName,
        accountNumber,
        password
      );

      // Save token & update context
      loginCustomer(data.token);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error caught:", err);
      setError(
        err.message || "Login failed. Please check your credentials."
      );
    }
  };

  // Show loading state
  if (customerLoading || employeeLoading) {
    return <div className="login-container"><p>Loading...</p></div>;
  }

  return (
    <div className="login-container">
      <h2>Customer Login</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Full Name:</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
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
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;