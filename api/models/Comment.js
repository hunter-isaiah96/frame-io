import Sequelize from 'sequelize';
import db from '../db';

const Comment = db.define('comment', {
  text: {
    type: Sequelize.STRING,
    allowNull: false
  },
  timestamp: {
    type: Sequelize.NUMBER,
    allowNull: false
  },
  meta_data: {
    type: Sequelize.JSON,
    allowNull: false
  },
  created_by: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  content_id: {
    type: Sequelize.INTEGER,
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

module.exports = Comment;