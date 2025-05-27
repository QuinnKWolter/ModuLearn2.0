module.exports = (sequelize, DataTypes) => {
  const Progress = sequelize.define('Progress', {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    percent:      { type: DataTypes.DECIMAL(5,2), defaultValue: 0 },
    score:        { type: DataTypes.FLOAT },
    maxScore:     { type: DataTypes.FLOAT },
    startedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    completedAt:  { type: DataTypes.DATE },
    lastInteractionAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    submittedToLms:    { type: DataTypes.BOOLEAN, defaultValue: false },
    metadata:     { type: DataTypes.JSONB },
    state:        { type: DataTypes.JSONB }
  }, {
    tableName:    'progress',
    indexes: [
      { unique: true, fields: ['ModuleId', 'EnrollmentId'] }
    ]
  });

  Progress.associate = models => {
    Progress.belongsTo(models.User);
    Progress.belongsTo(models.Module, { foreignKey: 'ModuleId' });
    Progress.belongsTo(models.Unit);
    Progress.belongsTo(models.Course);
    Progress.belongsTo(models.Session);
    Progress.belongsTo(models.Enrollment);
  };

  return Progress;
};
