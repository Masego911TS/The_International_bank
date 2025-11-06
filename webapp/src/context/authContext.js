import { createContext, useState, useEffect } from "react";

export const authContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing customer token on load
  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (token) setIsAuthenticated(true);
  }, []);

  //Login function to store JWT token
  const loginCustomer = (token) => {
    localStorage.setItem("customerToken", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("customerToken");
    setIsAuthenticated(false);
  };

  return (
    <authContext.Provider
      value={{
        isAuthenticated,
        loginCustomer, 
        logout,
      }}
    >
      {children}
    </authContext.Provider>
  );
};
