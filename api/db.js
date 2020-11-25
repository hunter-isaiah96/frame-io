import Sequelize from 'sequelize'
const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host:'postgres_container',
  dialect: 'postgres' 
})
const db = {}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./models/User')(sequelize, Sequelize)
db.contents = require('./models/Content')(sequelize, Sequelize)

db.users.hasMany(db.contents, { as: "content" });
db.contents.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});

db.contents.belongsTo(db.contents, {
  foreignKey: "contentId",
  as: "versions",
})

module.exports = db

// const Pool = require('pg').Pool

// const pool = new Pool({
//   user: 'postgres',
//   password: 'isaiah',
//   host: 'localhost',
//   port: 5432,
//   database: 'eyeapprove'
// })