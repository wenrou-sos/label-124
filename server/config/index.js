module.exports = {
  port: 3000,
  dataSource: 'memory',

  mysql: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'drive_school',
    connectionLimit: 10,
  },

  jwt: {
    secret: 'drive-school-jwt-secret-2024',
    expiresIn: '7d',
  },

  booking: {
    cancelWindowHours: 2,
  },
}
