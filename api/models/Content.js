import Sequelize from 'sequelize';
import db from '../db';
import Comment from './Comment';
import User from './User';

const Content = db.define('content', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  user_id: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false,
  },
  type: {
    type: Sequelize.STRING(15),
    allowNull: false,
  },
  version: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  media: {
    type: Sequelize.JSON,
    allowNull: false
  },
  created_at: {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false
  },
  updated_at: {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false
  }
}, {
  timestamps: false,
  freezeTableName: true
});

Content.associate = function(models) { 
  Content.belongsTo(models.users, { foreignKey: 'user_id', as: 'user' })
}

// Content.belongsTo(User, {
//   as: 'User',
//   foreignKey: 'user_id'
// });

// Content.hasMany(Comment, {
//   as: 'comments'
// });

// Content.hasMany(Content, {
//   as: 'content'
// });

module.exports = Content;