const express = require('express');
const router  = express.Router();
const { User, Enrollment } = require('../models');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

/* ------------------------------------------------------------------ */
/*  PUT /roles                                                        */
/* ------------------------------------------------------------------ */
router.put('/roles', async (req, res, next) => {
  try {
    const { roles } = req.body;           // expected shape { student, instructor, researcher }
    const ALLOWED  = ['student', 'instructor', 'researcher'];

    /* sanity-check keys */
    if (!roles || Object.keys(roles).some(k => !ALLOWED.includes(k))) {
      return res.status(400).json({ error: 'Malformed roles object' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    /* prevent dropping a role that has active enrollments */
    const active = await Enrollment.findAll({
      where: { UserId: user.id, isActive: true },
      attributes: ['role']
    });
    const activeRoles = new Set(active.map(e => e.role));

    for (const r of activeRoles) {
      if (!roles[r]) {
        return res.status(400).json({ error: `Cannot remove role "${r}" with active enrollments` });
      }
    }

    user.roles = roles;
    await user.save();
    res.json({ roles: user.roles });
  } catch (err) { next(err); }
});

module.exports = router;