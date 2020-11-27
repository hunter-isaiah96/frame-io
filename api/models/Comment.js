module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define("comment", {
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        metaData: {
            type: DataTypes.JSON,
            allowNull: true
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
    return Comment;
};