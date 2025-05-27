module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title:       { type: DataTypes.STRING,  allowNull: false },
    description: { type: DataTypes.TEXT },
    ltiCourseId: { type: DataTypes.STRING },
    ltiContextId:{ type: DataTypes.STRING },
    status:      { type: DataTypes.ENUM('draft','published','archived'), defaultValue: 'draft' },
    metadata:    { type: DataTypes.JSON },
    settings:    { type: DataTypes.JSONB, defaultValue: {} },
    isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
    createdById: { type: DataTypes.UUID, allowNull: false }
  });

  Course.associate = models => {
    Course.hasMany      (models.Unit,     { onDelete: 'CASCADE' });
    Course.hasMany      (models.Session,  { onDelete: 'CASCADE' });
    Course.hasMany      (models.Progress, { onDelete: 'CASCADE' });
    Course.belongsTo    (models.User,     { foreignKey: 'createdById', as: 'creator' });
    Course.belongsToMany(models.User,     { through: 'CourseInstructors', as: 'instructors' });
  };

  return Course;
};
