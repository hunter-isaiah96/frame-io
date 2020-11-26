module.exports = (sequelize, DataTypes) => {
  const Content = sequelize.define("content", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    contentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    media: {
      type: DataTypes.JSON,
      allowNull: false
    },
  });

  return Content;
};