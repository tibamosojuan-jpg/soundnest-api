import pool from '../config/database.js';
import { toWhereClause } from '../utils/sql.js';

const userColumns = 'id, name, email, role, status, created_at AS createdAt';
const updatableColumns = ['name', 'email', 'password', 'status'];

export async function insertUser({ name, email, password }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );
  return result.insertId;
}

export async function findUserById(userId) {
  const [rows] = await pool.query(`SELECT ${userColumns} FROM users WHERE id = ?`, [userId]);
  return rows[0] ?? null;
}

export async function findCredentialsByEmail(email) {
  const [rows] = await pool.query('SELECT id, password FROM users WHERE email = ?', [email]);
  return rows[0] ?? null;
}

export async function findUsers({ search, status, limit, offset }) {
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    values.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    conditions.push('status = ?');
    values.push(status);
  }

  const [rows] = await pool.query(
    `SELECT ${userColumns} FROM users ${toWhereClause(conditions)} ORDER BY id LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  return rows;
}

export async function updateUser(userId, changes) {
  const fields = Object.keys(changes).filter((field) => updatableColumns.includes(field));
  const assignments = fields.map((field) => `${field} = ?`).join(', ');

  await pool.query(
    `UPDATE users SET ${assignments} WHERE id = ?`,
    [...fields.map((field) => changes[field]), userId]
  );
}
