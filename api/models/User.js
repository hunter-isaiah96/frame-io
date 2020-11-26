module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    hashed_password: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
  })
  // User.associate = models => {
  //   User.hasMany(models.content, { as: "content" });
  //   User.hasMany(models.comment, { as: "comments" });
  // }
  return User;
};