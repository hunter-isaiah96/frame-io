import Sequelize from 'sequelize'

module.exports = new Sequelize('eyeapprove', 'postgres', 'isaiah', {
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