import pool from '../config/database.js';

const artistColumns = 'id, name, bio, image_url AS imageUrl, status, created_at AS createdAt';

export async function findArtists({ limit, offset }) {
  const [rows] = await pool.query(
    `SELECT ${artistColumns} FROM artists ORDER BY name LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
}

export async function findArtistById(artistId) {
  const [rows] = await pool.query(`SELECT ${artistColumns} FROM artists WHERE id = ?`, [artistId]);
  return rows[0] ?? null;
}

export async function insertArtist({ name, bio, imageUrl }) {
  const [result] = await pool.query(
    'INSERT INTO artists (name, bio, image_url) VALUES (?, ?, ?)',
    [name, bio ?? null, imageUrl ?? null]
  );
  return result.insertId;
}

export async function updateArtist(artistId, { name, bio, imageUrl, status }) {
  await pool.query(
    'UPDATE artists SET name = ?, bio = ?, image_url = ?, status = ? WHERE id = ?',
    [name, bio ?? null, imageUrl ?? null, status, artistId]
  );
}
