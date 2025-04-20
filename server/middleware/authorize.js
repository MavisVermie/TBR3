const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(403).json({ msg: "Authorization denied. No token found." });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ msg: "Authorization token missing." });
  }

  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    if (!verify.userId) {
      console.error("Invalid token structure: userId not found");
      return res.status(403).json({ msg: "Invalid token structure" });
    }

    req.user = verify.userId; // ✅ Correct!
    next();
  } catch (err) {
    console.error("Authorization error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
