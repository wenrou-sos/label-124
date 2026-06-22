const mysql = require('mysql2/promise')
const config = require('../config')

const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  connectionLimit: config.mysql.connectionLimit,
  waitForConnections: true,
  queueLimit: 0,
})

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

async function getOne(sql, params = []) {
  const rows = await query(sql, params)
  return rows[0] || null
}

async function insert(sql, params = []) {
  const [result] = await pool.execute(sql, params)
  return result.insertId
}

async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params)
  return result
}

async function transaction(callback) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const result = await callback(conn)
    await conn.commit()
    return result
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

module.exports = {
  pool,
  query,
  getOne,
  insert,
  execute,
  transaction,
}
