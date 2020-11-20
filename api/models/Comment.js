import Sequelize from 'sequelize';
import db from '../db';

const Comment = db.define('comment', {
  text: {
    type: Sequelize.STRING,
    allowNull: false
  },
  timestamp: {
    type: Sequelize.INTEGER,
    allowNull: true,
    default: null
  },
  meta_data: {
    type: Sequelize.JSON,
    allowNull: false
  },
  reply_to: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  version: {
    type: Sequelize.INTEGER,
    allowNull: true
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
  timestamps: false
});

// Comment.associate = models => {
//   Comment.belongsTo(models.User, {
//     foreignKey: {
//       allowNull: false
//     }
//   })
//   Comment.belongsTo(models.Post, {
//     foreignKey: {
//       allowNull: false
//     }
//   })
// }

module.exports = Comment;