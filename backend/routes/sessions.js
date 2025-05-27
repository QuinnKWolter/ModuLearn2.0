const express = require('express');
const router  = express.Router();
const crypto = require('crypto');
const { Op, fn, col, literal } = require('sequelize');
const { Sequelize } = require('sequelize');

const { Session, Enrollment, User, Progress } = require('../models');
const { authenticateToken }   = require('../middlewares/auth');
const { checkInstructorRole } = require('../middlewares/roles');

router.use(authenticateToken);

/* ══════════════════════════════════════════════════════════════════ */
/*  preload :sessionId                                                */
/* ══════════════════════════════════════════════════════════════════ */
router.param('sessionId', async (req, res, next, id) => {
  try {
    const session = await Session.findByPk(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    req.sessionObj = session;
    next();
  } catch (err) { next(err); }
});

/* helper: ensure the requester teaches this session */
const isInstructor = (sessionId, userId) =>
  Enrollment.findOne({
    where: { SessionId: sessionId, UserId: userId, role: 'instructor', isActive: true }
  });

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /:sessionId – detail for any learner enrolled in the session  */
/* ══════════════════════════════════════════════════════════════════ */
router.get('/:sessionId', async (req, res, next) => {
  try {
    const sessionId = req.sessionObj.id;

    /* caller must be student OR instructor of this session ---------- */
    const enrollment = await Enrollment.findOne({
      where: { SessionId: sessionId, UserId: req.user.id, isActive: true }
    });
    if (!enrollment) {
      return res
        .status(403)
        .json({ error: 'You are not enrolled in this session' });
    }

    /* course ➜ units ➜ modules (+ THIS learner’s progress on each) */
    const { Course, Unit, Module, Progress } = require('../models');

    const session = await Session.findByPk(sessionId, {
      attributes: ['id', 'groupName', 'isActive', 'metadata'],
      include: [
        {
          model: Course,
          attributes: ['id', 'title', 'description'],
          include: [
            {
              model: Unit,
              attributes: [
                'id',
                'title',
                'description',
                'unitType',
                'createdAt' // sort key on the front-end
              ],
              order: [['createdAt', 'ASC']],
              include: [
                {
                  model: Module,
                  attributes: {
                    include: [
                      'id',
                      'title',
                      'url',
                      'providerId',
                      'order',
                      [literal('"Course->Units->Modules->Progresses"."percent"'), 'percent'],
                      [literal('"Course->Units->Modules->Progresses"."score"'),   'score']
                    ]
                  },
                  order: [['order', 'ASC']],
                  include: [
                    {
                      model: Progress,
                      as: 'Progresses',     // alias matches Module.associate
                      attributes: ['percent', 'score'],       // hide raw columns, expose via col() above
                      where: { UserId: req.user.id },
                      required: false       // include modules the learner hasn’t opened yet
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (err) {
    next(err);
  }
});

/* ════════════════════════════════════════════════════════════════ */
/*  GET /:sessionId/overview – course, units & modules (students)   */
/* ════════════════════════════════════════════════════════════════ */
router.get('/:sessionId/overview', async (req, res, next) => {
  try {
    const session   = req.sessionObj;      // from router.param
    const { User, Unit, Module, Course } = require('../models');

    /* ---------- membership check ---------- */
    const teaches    = await session.hasInstructor?.(req.user);
    const enrollment = await Enrollment.findOne({
      where: { SessionId: session.id, UserId: req.user.id, isActive: true }
    });
    if (!teaches && !enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this session' });
    }

    /* ---------- course, units, modules ---------- */
    const course = await Course.findByPk(session.CourseId, {
      attributes: ['id', 'title', 'description'],
      include: [{
        model: Unit,
        attributes: ['id', 'title', 'description', 'unitType', 'order'],
        include : [{
          model: Module,
          attributes: [
            'id', 'title', 'description',
            'providerId', 'url', 'authorId', 'order'
          ],
          order: [['order', 'ASC']]
        }],
        order: [['order', 'ASC']]
      }]
    });

    res.json({
      session : { id: session.id, groupName: session.groupName },
      course
    });
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /:sessionId/enrollments – Instructor roster                   */
/* ══════════════════════════════════════════════════════════════════ */
router.get('/:sessionId/enrollments', checkInstructorRole, async (req, res, next) => {
  try {
    if (!await isInstructor(req.sessionObj.id, req.user.id)) {
      return res.status(403).json({ error: 'You are not an instructor for this session' });
    }

    const students = await Enrollment.findAll({
      where: { SessionId: req.sessionObj.id, role: 'student', isActive: true },
      attributes: ['id', 'lastActivity'],
      include: [{ model: User, attributes: ['id', 'fullName', 'email'] }],
      order: [[User, 'fullName', 'ASC']]
    });

    res.json(students);
  } catch (err) { next(err); }
});

/* ------------------------------------------------------------------ */
/*  POST /:sessionId/enroll  – invite / (re-)enrol a list of e-mails   */
/* ------------------------------------------------------------------ */
router.post('/:sessionId/enroll', checkInstructorRole, async (req, res, next) => {
  try {
    const { emails } = req.body;                // expecting { emails:[…] }
    if (!Array.isArray(emails) || !emails.length) {
      return res.status(400).json({ error: 'emails[] is required' });
    }

    /* ensure requester really teaches this session */
    if (!await isInstructor(req.sessionObj.id, req.user.id)) {
      return res.status(403).json({ error: 'You are not an instructor for this session' });
    }

    const created   = [];
    const existing  = [];

    for (const raw of emails) {
      const email = raw.trim().toLowerCase();
      if (!email) continue;

      /* 1) user record ------------------------------------------------ */
      const [user] = await User.findOrCreate({
        where   : { email: { [Op.iLike]: email } },
        defaults: {
          email,
          fullName: null,              // blank – they'll fill this on first log-in
          password: crypto.randomUUID(),// random hash – forces password-reset
          roles   : { student: true, instructor: false, researcher: false },
          isActive: true
        }
      });

      /* 2) enrollment --------------------------------------------------- */
      const [enrollment, wasCreated] = await Enrollment.findOrCreate({
        where   : { UserId: user.id, SessionId: req.sessionObj.id },
        defaults: { role: 'student', isActive: true }
      });

      if (wasCreated) {
        // Fetch all modules in the course attached to this session
        const course = await req.sessionObj.getCourse({
          include: [{ model: require('../models').Unit, include: [require('../models').Module] }]
        });
      
        const modules = course.Units.flatMap(unit => unit.Modules || []);
      
        const progressToCreate = modules.map(mod => ({
          UserId: user.id,
          ModuleId: mod.id,
          EnrollmentId: enrollment.id,
          percent: 0,
          score: null,
          state_data: null
        }));
      
        if (progressToCreate.length > 0) {
          await require('../models').Progress.bulkCreate(progressToCreate, { ignoreDuplicates: true });
        }
      }

      if (wasCreated) created.push({ email });
      else            existing.push({ email });

      // TODO: send invite e-mail via SES here (left out for brevity)
    }

    /* 3) return fresh roster ------------------------------------------ */
    const roster = await Enrollment.findAll({
      where: { SessionId: req.sessionObj.id, role: 'student', isActive: true },
      attributes: ['id', 'lastActivity'],
      include: [{ model: User, attributes: ['id', 'fullName', 'email'] }],
      order: [[User, 'fullName', 'ASC']]
    });

    res.json({ added: created.length, skipped: existing.length, roster });
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /:sessionId/performance – roster + first progress row         */
/* ══════════════════════════════════════════════════════════════════ */
router.get('/:sessionId/performance', checkInstructorRole, async (req, res, next) => {
  try {
    if (!await isInstructor(req.sessionObj.id, req.user.id)) {
      return res.status(403).json({ error: 'You are not an instructor for this session' });
    }

    const roster = await Enrollment.findAll({
      where: { SessionId: req.sessionObj.id, role: 'student', isActive: true },
      attributes: [
        'id',
        'lastActivity',
        [fn('AVG', col('Progresses.percent')), 'avgPercent'],
        [fn('AVG', col('Progresses.score')),   'avgScore']
      ],
      include: [
        { model: User, attributes: ['id', 'fullName', 'email'] },
        { model: Progress, as: 'Progresses', attributes: [] }   // just for AVG()
      ],
      group: ['Enrollment.id', 'User.id'],
      order: [[User, 'fullName', 'ASC']]
    });

    const out = roster.map(r => ({
      id          : r.id,
      student     : r.User,
      progress    : { percent: r.get('avgPercent'), score: r.get('avgScore') },
      lastActivity: r.lastActivity
    }));

    res.json(out);
  } catch (err) { next(err); }
});

module.exports = router;