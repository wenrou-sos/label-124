const mysql = require('mysql2/promise')
const config = require('../config')

let pool = null

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      connectionLimit: config.mysql.connectionLimit,
      waitForConnections: true,
      charset: 'utf8mb4',
    })
  }
  return pool
}

async function query(sql, params = []) {
  const p = getPool()
  const [rows] = await p.execute(sql, params)
  return rows
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params)
  return rows[0] || null
}

async function insert(sql, params = []) {
  const result = await query(sql, params)
  return result.insertId
}

async function update(sql, params = []) {
  const result = await query(sql, params)
  return result.affectedRows
}

module.exports = { getPool, query, queryOne, insert, update }
