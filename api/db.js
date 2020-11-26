import Sequelize from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: 'postgres_container',
  dialect: 'postgres'
});

const User = require('./models/User')(sequelize, Sequelize);
const Content = require('./models/Content')(sequelize, Sequelize);
const Comment = require('./models/Comment')(sequelize, Sequelize);

// User Relations
User.hasMany(Content, { as: 'content' });
User.hasMany(Comment, { as: 'all_comments' });

// Content Relations
Content.hasMany(Comment, { as: 'comments' })

Content.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Content.belongsTo(Content, {
  foreignKey: "contentId"
});

Content.hasMany(Content, { as: 'versions' })

// Comment Relations
Comment.hasMany(Comment, { as: 'replies' });

Comment.belongsTo(Comment, { foreignKey: "commentId" });

Comment.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  User,
  Content,
  Comment,
  sequelize,
};
