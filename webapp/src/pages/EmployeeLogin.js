import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { employeeContext } from "../context/employeeContext";
import { authContext } from "../context/authContext";
import { loginEmployee as loginEmployeeService } from "../services/employeeService";
import "./EmployeeLogin.css";

function EmployeeLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { loginEmployee, isEmployeeAuthenticated, isLoading: employeeLoading } =
    useContext(employeeContext);
  const { isAuthenticated, isLoading: customerLoading } = useContext(authContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (employeeLoading || customerLoading) return; //Wait for loading to finish
    
    if (isEmployeeAuthenticated) {
      navigate("/employee-portal");
    } else if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isEmployeeAuthenticated, isAuthenticated, employeeLoading, customerLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Prevent employee login if a customer session exists
    if (isAuthenticated) {
      setError(
        "You are currently logged in as a customer. Please log out first."
      );
      return;
    }

    try {
      const data = await loginEmployeeService(username, password);

      // Save token & update context
      loginEmployee(data.token);

      navigate("/employee-portal");
    } catch (err) {
      setError(
        err.message || "Login failed. Please check your credentials."
      );
    }
  };

  // Show loading state
  if (employeeLoading || customerLoading) {
    return <div className="employee-login-container"><p>Loading...</p></div>;
  }

  return (
    <div className="employee-login-container">
      <h2>Employee Login</h2>
      {error && <p className="error-message">{error}</p>}

      <form className="employee-login-form" onSubmit={handleSubmit}>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isAuthenticated}
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isAuthenticated}
        />

        <button type="submit" disabled={isAuthenticated}>
          Login
        </button>
      </form>
    </div>
  );
}

export default EmployeeLogin;