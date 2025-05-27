const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const { v4: uuidv4 } = require('uuid');

const { User }            = require('../models');
const { authenticateToken } = require('../middlewares/auth');
const { checkInstructorRole } = require('../middlewares/roles');

const AUTHORING_API =
  process.env.AUTHORING_URL ||
  'https://proxy.personalized-learning.org/next.course-authoring/api';

/* ------------------------------------------------------------------ */
/*  POST /course-authoring-token                                       */
/* ------------------------------------------------------------------ */
router.post(
  '/course-authoring-token',
  authenticateToken,
  checkInstructorRole,
  async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (!user.course_authoring_password) {
        user.course_authoring_password = uuidv4();
        await user.save();
      }

      const { data: token } = await axios.post(
        `${AUTHORING_API}/auth/x-login-token`,
        {
          fullname: user.fullName,
          email:    user.email,
          password: user.course_authoring_password
        }
      );

      res.json({ token });
    } catch (err) {
      const code = err.response?.status || 500;
      next({ status: code, message: 'Failed to generate authoring token' });
    }
  }
);

module.exports = router;