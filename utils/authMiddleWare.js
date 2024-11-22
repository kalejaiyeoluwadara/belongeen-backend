const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized, user not found" });
    }

    req.user = user; // Attach user to the request object
    next(); // Proceed to the next middleware or controller
  } catch (error) {
    res.status(401).json({ error: "Unauthorized, token invalid" });
  }
};

module.exports = authMiddleware;
