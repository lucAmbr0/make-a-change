#!/usr/bin/env node
// Hash plaintext passwords in `users.password_hashed` if they are stored as plain text.
// Usage: node scripts/hash_seed_passwords.js

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'make_a_change';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

async function main() {
  const pool = await mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 5,
  });

  const [rows] = await pool.query('SELECT id, password_hashed FROM users');
  let updated = 0;

  for (const row of rows) {
    const id = row.id;
    const current = row.password_hashed || '';
    // consider it unhashed if it doesn't start with $2 (bcrypt) or its length is less than 50
    const looksHashed = typeof current === 'string' && current.startsWith('$2');
    if (!looksHashed) {
      const hash = await bcrypt.hash(current, 10);
      await pool.query('UPDATE users SET password_hashed = ? WHERE id = ?', [hash, id]);
      console.log(`Updated user ${id} password -> hashed`);
      updated++;
    } else {
      console.log(`User ${id} looks already hashed, skipping`);
    }
  }

  console.log(`Done. ${updated} password(s) hashed.`);
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});