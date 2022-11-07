const jwt = require("jsonwebtoken");

function verifyAuthToken(req, res, next) {
  const authToken = req.header("auth-token");
  if (!authToken) {
    res.status(401).send({ message: "Access denied" });
  }
  next();
}

function verifyRefreshToken(req, res, next) {
  const refreshToken = req.header("refresh-token");
  if (!refreshToken) {
    res.status(401).send({ message: "Access denied" });
  }
  next();
}

module.exports.verifyAuthToken = verifyAuthToken;
module.exports.verifyRefreshToken = verifyRefreshToken;
