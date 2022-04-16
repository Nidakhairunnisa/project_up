const Pool = require('pg').Pool

const pool = new Pool({
    user:"postgres",
    password:"Bukalah123",
    database:"db_toko",
    host:"localhost",
    port:5432
})

module.exports = pool