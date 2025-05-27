const express = require('express');
const router  = express.Router();
const axios   = require('axios');

const {
  Course,
  Session,
  Unit,
  Module,
  User,
  Enrollment
} = require('../models');

const { authenticateToken }  = require('../middlewares/auth');
const { checkInstructorRole } = require('../middlewares/roles');

const EXTERNAL_API =
  process.env.AUTHORING_URL ||
  'https://proxy.personalized-learning.org/next.course-authoring/api';

/* ------------------------------------------------------------------ */
/*  Pre-route auth                                                    */
/* ------------------------------------------------------------------ */
router.use(authenticateToken);

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /  – list instructor’s courses                                */
/* ══════════════════════════════════════════════════════════════════ */
router.get('/', checkInstructorRole, async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      where: { createdById: req.user.id },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id','title','description','ltiCourseId','ltiContextId',
        'metadata','settings','isActive','createdAt'
      ],
      include: [{ model: Session, attributes: ['id','groupName','isActive'] }]
    });
    res.json(courses);
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════════════════════════════════ */
/*  POST /  – create course (by ID or raw JSON)                       */
/* ══════════════════════════════════════════════════════════════════ */
router.post('/', checkInstructorRole, async (req, res, next) => {
  try {
    console.log("Creating course")
    const { courseId, courseData } = req.body;

    if (!courseId && !courseData)
      return res.status(400).json({ error: 'Provide courseId or courseData' });

    let raw = courseData;
    if (courseId) raw = await fetchCourseDetails(courseId);

    const transformed = transformCourseData(raw);
    const course      = await createCourseFromData(transformed, req.user.id);

    res.json({ success: true, course: { id: course.id, title: course.title } });
  } catch (err) { next(err); }
});

/* ------------------------------------------------------------------ */
/*  Helpers – external fetch + transform                              */
/* ------------------------------------------------------------------ */
async function fetchCourseDetails(id) {
  const { data } = await axios.get(`${EXTERNAL_API}/courses/${id}/export`, {
    headers: { Accept: 'application/json' }
  });
  return data;
}

/**
 * Map external JSON → internal shape used by createCourseFromData.
 * (unchanged from your original, but you can tweak at will)
 */
function transformCourseData(ext) {
  return {
    title:       ext.name || ext.title || 'Untitled Course',
    description: ext.description || '',
    metadata: {
      externalId: ext.id,
      code: ext.code,
      domain: ext.domain,
      institution: ext.institution,
      resources: ext.resources,
      tags: ext.tags,
      instructor: ext.instructor
    },
    units: (ext.units || []).map((u, idx) => ({
      title: u.name,
      description: u.description || '',
      order: idx,
      activities: Object.values(u.activities || {}).flat()
    }))
  };
}

/* ------------------------------------------------------------------ */
/*  Persist course / units / modules                                  */
/* ------------------------------------------------------------------ */
async function createCourseFromData(data, userId) {
  return Course.sequelize.transaction(async (t) => {
    const course = await Course.create(
      {
        title: data.title,
        description: data.description,
        metadata: data.metadata,
        createdById: userId,
        status: 'draft',
        isActive: true
      },
      { transaction: t }
    );

    for (const unitPayload of data.units) {
      const unit = await Unit.create(
        {
          title: unitPayload.title,
          description: unitPayload.description,
          order: unitPayload.order,
          CourseId: course.id,
          unitType: 'content',
          content: {}
        },
        { transaction: t }
      );

      for (const act of unitPayload.activities) {
        await Module.create(
          {
            title: act.name,
            description: '',
            content: {
              provider: act.provider_id,
              url: act.url,
              activityId: act.id
            },
            providerId: act.provider_id,
            authorId:   act.author_id,
            url:        act.url,
            tags:       act.tags,
            UnitId:     unit.id
          },
          { transaction: t }
        );
      }
    }

    return course;
  });
}

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /:id  – course detail                                         */
/* ══════════════════════════════════════════════════════════════════ */
router.get('/:id', checkInstructorRole, async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: Unit,
          attributes: ['id','title','description','order'],
          include: [{
            model: Module,
            attributes: ['id','title','providerId','url']
          }],
          order: [['order','ASC']]
        },
        { model: Session, attributes: ['id','groupName','isActive','createdAt'] }
      ]
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════════════════════════════════ */
/*  DELETE /:id – remove a course                                     */
/* ══════════════════════════════════════════════════════════════════ */
router.delete('/:id', checkInstructorRole, async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    await course.destroy();
    res.json({ success: true });
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════════════════════════════════ */
/*  GET /:id/sessions – list sessions for course                      */
/* ══════════════════════════════════════════════════════════════════ */
router.get('/:id/sessions', checkInstructorRole, async (req, res, next) => {
  try {
    const sessions = await Session.findAll({
      where: { CourseId: req.params.id },
      attributes: ['id','groupName','isActive','createdAt'],
      include: [{
        model: Enrollment,
        attributes: ['id','UserId','role','lastActivity','status'],
        include: [{ model: User, attributes: ['id','email','fullName'] }]
      }],
      order: [['createdAt','ASC']]
    });
    res.json(sessions);
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════════════════════════════════ */
/*  POST /:courseId/sessions – create a session                       */
/* ══════════════════════════════════════════════════════════════════ */
router.post('/:courseId/sessions', checkInstructorRole, async (req, res, next) => {
  try {
    const { groupName } = req.body;
    const { courseId }  = req.params;

    if (!groupName?.trim()) {
      return res.status(400).json({ error: 'Session name required' });
    }

    const course = await Course.findOne({
      where: { id: courseId, createdById: req.user.id }
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const exists = await Session.findOne({ where: { CourseId: courseId, groupName } });
    if (exists) return res.status(400).json({ error: 'Session name already used' });

    const session = await Session.create({
      groupName,
      CourseId: courseId,
      isActive: true
    });

    await Enrollment.create({
      UserId: req.user.id,
      SessionId: session.id,
      role: 'instructor',
      isActive: true
    });

    res.json({ success: true, session });
  } catch (err) { next(err); }
});

/* ══════════════════════════════════════════════════════════════════ */
/*  POST /:sessionId/enroll – bulk enroll students                    */
/* ══════════════════════════════════════════════════════════════════ */
router.post('/:sessionId/enroll', checkInstructorRole, async (req, res, next) => {
  try {
    const { emails }   = req.body;
    const { sessionId} = req.params;

    if (!Array.isArray(emails) || !emails.length)
      return res.status(400).json({ error: 'emails[] required' });

    const session = await Session.findByPk(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const results = { success: true, successCount: 0, errorCount: 0, errors: [] };

    for (const email of emails) {
      try {
        const [user] = await User.findOrCreate({
          where: { email },
          defaults: {
            fullName: email.split('@')[0],
            password: Math.random().toString(36).slice(2),
            roles: { student: true }
          }
        });

        const [enroll, created] = await Enrollment.findOrCreate({
          where: { UserId: user.id, SessionId: sessionId },
          defaults: { role: 'student', isActive: true }
        });

        if (created) results.successCount++;
        else {
          results.errorCount++;
          results.errors.push(`${email} already enrolled`);
        }
      } catch (err) {
        results.errorCount++;
        results.errors.push(`${email}: ${err.message}`);
      }
    }
    res.json(results);
  } catch (err) { next(err); }
});

module.exports = router;