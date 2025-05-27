module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define('Module', {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title:        { type: DataTypes.STRING, allowNull: false },
    description:  { type: DataTypes.TEXT },
    order:        { type: DataTypes.INTEGER, defaultValue: 0 },
    content:      { type: DataTypes.JSON },
    metadata:     { type: DataTypes.JSON },
    providerId:   { type: DataTypes.STRING },
    authorId:     { type: DataTypes.STRING },
    url:          { type: DataTypes.TEXT },
    tags:         { type: DataTypes.JSONB }
  });

  Module.associate = models => {
    Module.belongsTo(models.Unit);
    Module.hasMany  (models.Progress, { as: 'Progresses', foreignKey:'ModuleId' });
  };

  return Module;
};
