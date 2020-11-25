module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define("comment", {
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.NUMBER,
            allowNull: true
        },
        file: {
            type: DataTypes.JSON,
            allowNull: true,
        }
    });
    return Comment;
};