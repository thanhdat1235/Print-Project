const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/jwt");

const config = process.env;

const isVerifyToken = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = await verifyToken(token, config.TOKEN_KEY);
    req.user = decoded;
    res.setHeader("Authorization", token);
    next();
  } catch (error) {
    return res.status(401).send("Invalid Token");
  }
};

module.exports = isVerifyToken;
