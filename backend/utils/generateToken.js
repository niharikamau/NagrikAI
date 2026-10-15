const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT containing the user's id.
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {string} signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
