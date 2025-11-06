import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authContext } from "../context/authContext";
import { employeeContext } from "../context/employeeContext";

const ProtectedRoute = ({ children, employeeProtected = false }) => {
  const { isAuthenticated } = useContext(authContext);
  const { isEmployeeAuthenticated } = useContext(employeeContext);
  const location = useLocation();

  //Prevent employees from accessing customer pages
  if (isEmployeeAuthenticated && !employeeProtected) {
    return <Navigate to="/employee-portal" replace />;
  }

  //Prevent customers from accessing employee pages
  if (isAuthenticated && employeeProtected) {
    return <Navigate to="/dashboard" replace />;
  }

  //Customer-protected route
  if (!employeeProtected && !isAuthenticated) {
    // if not logged in as customer → go to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  //Employee-protected route
  if (employeeProtected && !isEmployeeAuthenticated) {
    // if not logged in as employee → go to employee login
    return <Navigate to="/employee-login" state={{ from: location }} replace />;
  }

  //Allow access
  return children;
};

export default ProtectedRoute;
