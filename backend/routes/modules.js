/**
 * Module-level API
 *  GET  /api/modules/:id           – meta + caller’s progress
 *  GET  /api/modules/:id/state     – saved state JSON
 *  POST /api/modules/:id/progress  – score / state callback
 */
const express = require('express');
const router  = express.Router();
const { Op }  = require('sequelize');

const {
  Module,
  Unit,
  Course,
  Session,
  Enrollment,
  Progress,
  User
} = require('../models');

const { authenticateToken }  = require('../middlewares/auth');

router.use(authenticateToken);

/* ─────────────────────────────────────────────────────────────── */
/* helpers                                                        */
/* ─────────────────────────────────────────────────────────────── */
const resolveProviderUrl = raw => {
  try {
    const u = new URL(raw);
    if (u.searchParams.get('tool') === 'codecheck' && u.searchParams.has('sub')) {
      return `https://codecheck.me/files/wiley/${u.searchParams.get('sub')}`;
    }
  } catch { /* ignore */ }
  return raw;
};

const getOrCreateProgress = async (userId, moduleId, sessionId, isInstr) => {
  if (isInstr) {
    return Progress.findOrCreate({
      where: { UserId: userId, ModuleId: moduleId, EnrollmentId: null },
      defaults: { percent: 100, isComplete: true }
    }).then(([p]) => p);
  }
  /* find or create student enrollment */
  const enrollment = await Enrollment.findOrCreate({
    where: { UserId: userId, SessionId: sessionId },
    defaults: { role: 'student', isActive: true }
  }).then(([e]) => e);

  return Progress.findOrCreate({
    where: { UserId: userId, ModuleId: moduleId, EnrollmentId: enrollment.id },
    defaults: { percent: 0 }
  }).then(([p]) => p);
};

/* ─────────────────────────────────────────────────────────────── */
/*  GET /:id/state                                                */
/* ─────────────────────────────────────────────────────────────── */
router.get('/:id/state', async (req,res,next) => {
    try {
        const prog = await Progress.findOne({
        where: { ModuleId: req.params.id, UserId: req.user.id }
        });
        res.json({ state: prog?.state_data || null });
    } catch (err) { next(err); }
});

/* ─────────────────────────────────────────────────────────────── */
/*  POST /:id/progress                                            */
/* ─────────────────────────────────────────────────────────────── */
router.post('/:id/progress', async (req,res,next) => {
    try {
        if (!req.body?.data?.length) {
            return res.status(400).json({ error: 'Invalid payload' });
        }
        const activity = req.body?.data?.[0];

        const prog = await Progress.findOne({
            where: { ModuleId: req.params.id, UserId: req.user.id }
        });
        if (!prog) return res.status(404).json({ error: 'Progress row missing' });

        /* update */
        prog.attempts += 1;
        prog.score     = activity.score ?? prog.score;
        prog.percent   = activity.progress ?? prog.percent;
        prog.completed = !!activity.completion;
        prog.success   = !!activity.success;
        prog.state     = activity.response ?? prog.state;
        await prog.save();

        console.log(`[Progress] user=${req.user.id} module=${req.params.id} score=${prog.score} percent=${prog.percent} state=${prog.state}`);

        res.json({
        success: true,
        progress: {
            percent: prog.percent,
            score: prog.score,
            state: prog.state
        }
        });
    } catch (err) { next(err); }
});

/* ─────────────────────────────────────────────────────────────── */
/*  GET /:id                                                       */
/* ─────────────────────────────────────────────────────────────── */
router.get('/:id', async (req, res, next) => {
  try {
    console.log('GET /:id - Received module ID in params:', req.params.id);
    const module = await Module.findByPk(req.params.id, {
      include: [
        { model: Unit, include: [{ model: Course }] }
      ]
    });

    if (!module) {
        console.log('GET /:id - Module not found for ID:', req.params.id);
        return res.status(404).json({ error: 'Module not found' });
    }
    console.log('GET /:id - Found module:', module.id, module.title);

    /* figure out session (caller may be instructor or student) */
    const sessions = await Session.findAll({
      where: { CourseId: module.Unit.Course.id },
      include: [
        { model: Enrollment, where: { UserId: req.user.id }, required: false },
        { model: User, as: 'instructors', where: { id: req.user.id }, required: false }
      ]
    });

    const activeSession = sessions.find(
      s => s.Enrollments.length || s.instructors.length
    );
    if (!activeSession) {
        console.log('GET /:id - No active session found for user:', req.user.id);
        return res.status(403).json({ error: 'No access to this module' });
    }
    console.log('GET /:id - Active session:', activeSession.id);

    const isInstructor = !!activeSession.instructors.length;
    const progress = await getOrCreateProgress(
      req.user.id,
      module.id,
      activeSession.id,
      isInstructor
    );
    console.log('GET /:id - Progress retrieved/created:', progress.id);

    res.json({
      module: {
        id: module.id,
        title: module.title,
        description: module.description,
        providerId: module.providerId,
        rawUrl: module.content?.url || module.url,
        resolvedUrl: resolveProviderUrl(module.content?.url || module.url)
      },
      progress: {
        id: progress.id,
        percent: progress.percent,
        score: progress.score,
        state: progress.state
      },
      session: { id: activeSession.id },
      isInstructor
    });
  } catch (err) { next(err); }
});

module.exports = router;