const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user.id,
      email: user.email,
      roles: user.roles 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateTokens,
  verifyToken
}; 