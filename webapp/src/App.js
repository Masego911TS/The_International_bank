import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeePortal from "./pages/EmployeePortal";

// Contexts
import { authContext, AuthProvider } from "./context/authContext";
import { employeeContext, EmployeeProvider } from "./context/employeeContext";

// Protected route
import ProtectedRoute from "./components/ProtectedRoute";

// Shared button style
const buttonStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
};

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(authContext);
  const { isEmployeeAuthenticated, logoutEmployee } = useContext(employeeContext);
  const navigate = useNavigate();

  const handleCustomerLogout = () => {
    logout();
    navigate("/");
  };

  const handleEmployeeLogout = () => {
    logoutEmployee();
    navigate("/");
  };

  return (
    <nav>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "32px" }}>🏦</span>
          <div>
            <h1>The International Bank</h1>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link to="/">Home</Link>

          {/* Customer links: hide if employee is logged in */}
          {!isEmployeeAuthenticated && (
            isAuthenticated ? (
              <>
                <button onClick={handleCustomerLogout} style={{ ...buttonStyle, color: "blue" }}>
                  Customer Logout
                </button>
                <Link to="/dashboard">Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )
          )}

          {/* Employee links: hide if customer is logged in */}
          {!isAuthenticated && (
            isEmployeeAuthenticated ? (
              <>
                <Link to="/employee-portal">Employee Portal</Link>
                <button onClick={handleEmployeeLogout} style={{ ...buttonStyle, color: "green" }}>
                  Employee Logout
                </button>
              </>
            ) : (
              <Link to="/employee-login">Employee Login</Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
};



function App() {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <Router>
          <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
            <Navbar />

            <Routes>
              <Route path="/" element={<Home />} />

              {/* Customer */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Employee */}
              <Route path="/employee-login" element={<EmployeeLogin />} />
              <Route
                path="/employee-portal"
                element={
                  <ProtectedRoute employeeProtected>
                    <EmployeePortal />
                  </ProtectedRoute>
                }
              />
            </Routes>

            <footer>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "15px",
                }}
              >
                <span>🛡️</span>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Bank-Level Security</span>
              </div>
              <p>© 2025 The International Bank. All rights reserved.</p>
              <p style={{ fontSize: "12px", opacity: 0.7 }}>Licensed Financial Services Provider</p>
            </footer>
          </div>
        </Router>
      </EmployeeProvider>
    </AuthProvider>
  );
}

export default App;
