const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

/* ── ENV ─────────────────────────────────────────────────────────── */
const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set');
}

/* ── helpers ─────────────────────────────────────────────────────── */
const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, roles: user.roles };
  return {
    accessToken:  jwt.sign(payload, JWT_SECRET,         { expiresIn: '1h' }),
    refreshToken: jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
  };
};

/* ────────────────────────────────────────────────────────────────────
   POST /signup
   ───────────────────────────────────────────────────────────────── */
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password ≥ 8 chars'),
    body('fullName').notEmpty().withMessage('Full name is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password, fullName, roles } = req.body;
      const existing = await User.findOne({ where: { email } });

      /* invited user tries to sign-up manually → redirect */
      if (existing) {
        if (existing.status === 'invited')
          return res.status(200).json({ requiresInviteCompletion: true });
        return res.status(409).json({ message: 'Email already in use' });
      }

      const user = await User.create({
        email,
        password,            // hashed by model hook
        fullName,
        roles: roles || undefined,
        status: 'active',
        emailVerified: false
      });

      const { accessToken, refreshToken } = generateTokens(user);
      user.refreshToken = refreshToken;
      await user.save();

      res.status(201).json({
        user: { id: user.id, email: user.email, fullName, roles: user.roles },
        accessToken,
        refreshToken
      });
    } catch (err) { next(err); }
  }
);

/* ────────────────────────────────────────────────────────────────────
   POST /accept-invite
   ───────────────────────────────────────────────────────────────── */
router.post('/accept-invite', async (req, res) => {
  const { token, fullName, password } = req.body;
  const user = await User.findOne({ where: { inviteToken: token, status: 'invited' } });
  if (!user) return res.status(400).json({ msg: 'Invalid or expired invite.' });

  user.fullName      = fullName;
  user.password      = await bcrypt.hash(password, 10);
  user.status        = 'active';
  user.mustResetPw   = false;
  user.emailVerified = true;
  user.inviteToken   = null;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user);
  res.json({ accessToken, refreshToken, user });
});

/* ────────────────────────────────────────────────────────────────────
   POST /login
   ───────────────────────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('email', email);
  console.log('password', password);
  try {
    console.log('finding user');
    const user = await User.findOne({ where: { email } });
    console.log('user', user);

    /* cannot log in until invite accepted */
    if (!user || user.status === 'invited' || !(await bcrypt.compare(password, user.password))) {
      const msg = user?.status === 'invited'
        ? 'Please accept your invitation to activate this account.'
        : 'Invalid credentials';
      return res.status(401).json({ message: msg });
    }
    console.log('user', user);

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email, fullName: user.fullName, roles: user.roles }
    });
  } catch { res.status(500).json({ message: 'Internal server error' }); }
});

/* ══════════════════════════════════════════════════════════════════ */
/*  POST /refresh-token                                               */
/* ══════════════════════════════════════════════════════════════════ */
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json(tokens);
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

/* ══════════════════════════════════════════════════════════════════ */
/*  POST /logout                                                      */
/* ══════════════════════════════════════════════════════════════════ */
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const user = await User.findOne({ where: { refreshToken } });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /profile  – protected                                         */
/* ══════════════════════════════════════════════════════════════════ */
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'fullName', 'roles', 'avatar', 'lastLogin']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
