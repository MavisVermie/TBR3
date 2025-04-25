const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to verify token
module.exports = function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(403).json({ msg: "Authorization denied. No token found." });
    }

    const token = authHeader.split(' ')[1]; // "Bearer token"

    if (!token) {
      return res.status(403).json({ msg: "Authorization token missing." });
    }

    const verify = jwt.verify(token, process.env.JWT_SECRET);

    if (!verify.userId) {
      console.error('Invalid token structure: userId not found');
      return res.status(401).json({ msg: "Invalid token structure" });
    }

    req.user = verify.userId; // 🛠 Save userId directly
    next();
  } catch (err) {
    console.error('Authorization Error:', err.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
