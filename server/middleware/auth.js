const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect Route - JWT Verification Middleware
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this resource. Token missing.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database, excluding password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists in the system.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Auth Verification Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token.",
    });
  }
};

// Role Authorization Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to perform this action.`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};