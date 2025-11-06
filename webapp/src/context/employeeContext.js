import { createContext, useState, useEffect } from "react";

export const employeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [isEmployeeAuthenticated, setIsEmployeeAuthenticated] = useState(false);

  // Check for existing employee token on load
  useEffect(() => {
    const token = localStorage.getItem("employeeToken");
    if (token) setIsEmployeeAuthenticated(true);
  }, []);

  //Login function that saves token
  const loginEmployee = (token) => {
    localStorage.setItem("employeeToken", token);
    setIsEmployeeAuthenticated(true);
  };

  //Logout function
  const logoutEmployee = () => {
    localStorage.removeItem("employeeToken");
    setIsEmployeeAuthenticated(false);
  };

  return (
    <employeeContext.Provider
      value={{
        isEmployeeAuthenticated,
        loginEmployee,  
        logoutEmployee,
      }}
    >
      {children}
    </employeeContext.Provider>
  );
};
