module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    hashed_password: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
  })
  return User;
};