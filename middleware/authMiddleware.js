const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  console.log(jwt.decode(token));

  if (!token) return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    console.log("JWT_SECRET in middleware:", JSON.stringify(JWT_SECRET));

    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user; // attach decoded payload to request
    next();
  });
};

module.exports = authenticateToken;
