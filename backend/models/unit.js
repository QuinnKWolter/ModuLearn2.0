module.exports = (sequelize, DataTypes) => {
  const Unit = sequelize.define('Unit', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title:       { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    unitType:    { type: DataTypes.STRING, defaultValue: 'content' },
    content:     { type: DataTypes.JSON },
    order:       { type: DataTypes.INTEGER, defaultValue: 0 },
    metadata:    { type: DataTypes.JSON }
  });

  Unit.associate = models => {
    Unit.hasMany(models.Module, { onDelete: 'CASCADE' });
    Unit.belongsTo(models.Course);
    Unit.hasMany  (models.Progress);
  };

  return Unit;
};
