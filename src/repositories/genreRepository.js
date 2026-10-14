import pool from '../config/database.js';

export async function findAllGenres() {
  const [rows] = await pool.query('SELECT id, name FROM genres ORDER BY name');
  return rows;
}

export async function findGenreById(genreId) {
  const [rows] = await pool.query('SELECT id, name FROM genres WHERE id = ?', [genreId]);
  return rows[0] ?? null;
}

export async function insertGenre(name) {
  const [result] = await pool.query('INSERT INTO genres (name) VALUES (?)', [name]);
  return result.insertId;
}
