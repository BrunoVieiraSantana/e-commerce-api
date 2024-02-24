const { Pool } = require('pg')
 
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'e_commerce',
  password: 'admin',
  port: 5432,
})

pool.connect((err) => {
    if (err) throw err
    console.log("Connect to PostgreSQL successfully!")
})

module.exports = pool