import Sequelize from 'sequelize';
import db from '../db';

const Content = db.define('content', {
  type: {
    type: Sequelize.STRING(15),
    allowNull: false,
  },
  created_by: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  version: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  original_content_id: {
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

module.exports = Content;