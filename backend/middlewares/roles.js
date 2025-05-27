const checkInstructorRole = (req, res, next) => {
  if (req.user.roles && req.user.roles.instructor) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: You do not have the instructor role' });
};

const checkStudentRole = (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.student) {
    return res.status(403).json({ message: 'Forbidden: You do not have the student role' });
  }
  next();
};

const checkResearcherRole = (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.researcher) {
    return res.status(403).json({ message: 'Forbidden: You do not have the researcher role' });
  }
  next();
};

module.exports = {
  checkInstructorRole,
  checkStudentRole,
  checkResearcherRole
}; 