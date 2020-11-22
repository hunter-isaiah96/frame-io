import Sequelize from 'sequelize'

module.exports = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host:'localhost',
  dialect: 'postgres' 
})
// const Pool = require('pg').Pool

// const pool = new Pool({
//   user: 'postgres',
//   password: 'isaiah',
//   host: 'localhost',
//   port: 5432,
//   database: 'eyeapprove'
// })