export const validateRegister = (req, res, next) => {
  const { fullName, idNumber, accountNumber, password } = req.body;

  if (!fullName || !idNumber || !accountNumber || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!/^\d{13}$/.test(idNumber)) {
    return res.status(400).json({ message: "ID number must be 13 digits" });
  }

  if (!/^\d{10,12}$/.test(accountNumber)) {
    return res
      .status(400)
      .json({ message: "Account number must be 10-12 digits" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  // Passed validation
  next();
};

//validateLogin.js
export const validateLogin = (req, res, next) => {
  const { fullName, accountNumber, password } = req.body;

  // Check required fields
  if (!fullName || !accountNumber || !password) {
    return res.status(400).json({
      message: "Full name, account number, and password are required",
    });
  }

  if (typeof fullName !== "string" || fullName.trim().length < 2) {
    return res.status(400).json({ message: "Invalid full name" });
  }

  if (!/^\d+$/.test(accountNumber)) {
    return res.status(400).json({ message: "Account number must be numeric" });
  }

  next();
};

export const validatePayment = (req, res, next) => {
  const { amount, currency, payeeAccount, swiftCode } = req.body;

  if (!amount || !currency || !payeeAccount || !swiftCode) {
    return res.status(400).json({ message: "All payment fields are required" });
  }

  if (isNaN(amount) || Number(amount) <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a valid positive number" });
  }

  if (!/^[A-Z]{3}$/.test(currency)) {
    return res.status(400).json({
      message: "Currency must be a valid 3-letter ISO code (e.g., USD, ZAR)",
    });
  }

  if (!/^\d{10,12}$/.test(payeeAccount)) {
    return res
      .status(400)
      .json({ message: "Payee account number must be 10–12 digits" });
  }

  if (!/^[A-Z0-9]{8,11}$/.test(swiftCode)) {
    return res.status(400).json({ message: "Invalid SWIFT code format" });
  }

  next();
};
