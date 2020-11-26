module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define("comment", {
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        commentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        timestamp: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        file: {
            type: DataTypes.JSON,
            allowNull: true,
        }
    });
    // Comment.hasMany
    return Comment;
};