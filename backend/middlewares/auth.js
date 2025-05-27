/**
 * middlewares/auth.js – attaches `req.user` when JWT is valid
 */
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in env');
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;          // { id, email, roles }
    next();
  });
};

module.exports = { authenticateToken };
