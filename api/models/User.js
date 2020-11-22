import Sequelize from 'sequelize';
import db from '../db';
import Comment from './Comment';
import Content from './Content';

const User = db.define('user', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  hashed_password: {
    type: Sequelize.STRING(60),
    allowNull: false,
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
});

User.associate = models => {
  User.hasMany(models.content, {foreignKey: 'user_id', as: 'content'})
}

module.exports = User;