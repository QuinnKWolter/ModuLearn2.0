/* routes/enrollments.js */
const express = require('express');
const router  = express.Router();
const { Sequelize, fn, col } = require('sequelize');

const {
  Enrollment,
  Session,
  Course,
  User,
  Progress
} = require('../models');

const { authenticateToken }  = require('../middlewares/auth');
const { checkInstructorRole } = require('../middlewares/roles');

router.use(authenticateToken);

/* helper – session roster (students only) */
const rosterForSession = (sessionId) =>
  Enrollment.findAll({
    where: { SessionId: sessionId, role: 'student', isActive: true },
    attributes: ['id', 'lastActivity'],
    include: [
      { model: User, attributes: ['id', 'fullName', 'email'] },
      { model: Progress, as: 'Progresses', attributes: ['percent', 'score'], required: false }
    ],
    order: [[User, 'fullName', 'ASC']]
  });

/* ────────────────────────────────────────────────────────────────────
   GET /  →  my enrollments
   ───────────────────────────────────────────────────────────────── */
router.get('/', async (req, res, next) => {
  try {
    const rows = await Enrollment.findAll({
      where: { UserId: req.user.id, isActive: true },
      attributes: [
        'id',
        'role',
        'createdAt',
        'SessionId',
        [fn('AVG', col('Progresses.percent')), 'avgPercent'],
        [fn('AVG', col('Progresses.score')),   'avgScore']
      ],
      include: [
        {
          model: Session,
          attributes: ['id', 'groupName', 'isActive'],
          include: [{ model: Course, attributes: ['id', 'title', 'description'] }]
        },
        {
          model: Progress,
          as: 'Progresses',
          attributes: [], // don't return full array
          required: false,
          where: { UserId: req.user.id }
        }
      ],
      group: ['Enrollment.id', 'Session.id', 'Session->Course.id'],
      order: [['createdAt', 'DESC']]
    });

    const out = { asStudent: [], asInstructor: [], asResearcher: [] };

    rows.forEach((e) => {
      const course = e.Session?.Course;
      const rec = {
        id: e.id,
        role: e.role,
        createdAt: e.createdAt,
        session: {
          id: e.Session?.id,
          groupName: e.Session?.groupName,
          isActive: e.Session?.isActive
        },
        course: course && { id: course.id, title: course.title, description: course.description },
        progress: {
          percent: e.get('avgPercent'),
          score: e.get('avgScore')
        }
      };
      out[`as${e.role.charAt(0).toUpperCase()}${e.role.slice(1)}`].push(rec);
    });

    res.json(out);
  } catch (err) { next(err); }
});

/* ────────────────────────────────────────────────────────────────────
   GET /instructor  → sessions I teach (with roster)
   ───────────────────────────────────────────────────────────────── */
router.get('/instructor', checkInstructorRole, async (req, res, next) => {
  try {
    const sessions = await Session.findAll({
      include: [
        {
          association: 'instructors',            // scoped alias – role already = 'instructor'
          where: { id: req.user.id },
          through: { where: { isActive: true } },
          attributes: []
        },
        { model: Course, attributes: ['id', 'title', 'description'] },
        {
          model: Enrollment,
          include: [
            { model: User, attributes: ['id', 'email', 'fullName'] },
            { model: Progress, as: 'Progresses', attributes: ['percent', 'score'], required: false }
          ]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(sessions);
  } catch (err) { next(err); }
});

/* ────────────────────────────────────────────────────────────────────
   GET /sessions/:sessionId  → roster (legacy path)
   ───────────────────────────────────────────────────────────────── */
router.get('/sessions/:sessionId', checkInstructorRole, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const instructor = await Enrollment.findOne({
      where: { SessionId: sessionId, UserId: req.user.id, role: 'instructor', isActive: true }
    });
    if (!instructor) return res.status(403).json({ error: 'Not an instructor for this session' });

    res.json(await rosterForSession(sessionId));
  } catch (err) { next(err); }
});

/* ────────────────────────────────────────────────────────────────────
   DELETE /:id  → drop a student
   ───────────────────────────────────────────────────────────────── */
router.delete('/:id', checkInstructorRole, async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id, {
      include: [{ model: Session, include: [{ association: 'instructors' }] }]
    });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    const isInstr = enrollment.Session.instructors.some((u) => u.id === req.user.id);
    if (!isInstr) return res.status(403).json({ error: 'Not authorised for this session' });

    await enrollment.destroy();
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;