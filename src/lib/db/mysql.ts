import * as mysql from "mysql2/promise"

const DB_HOST = process.env.DB_HOST || "127.0.0.1"
const DB_USER = process.env.DB_USER || "root"
const DB_PASSWORD = process.env.DB_PASSWORD || ""
const DB_NAME = process.env.DB_NAME || "make_a_change"
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306

declare global {
  var mysqlPool: mysql.Pool | undefined
}

const pool =
  global.mysqlPool ??
  mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

if (process.env.NODE_ENV !== "production") {
  global.mysqlPool = pool
}

export default pool