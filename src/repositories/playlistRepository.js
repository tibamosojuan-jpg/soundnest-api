import pool from '../config/database.js';

const playlistColumns = 'id, user_id AS userId, name, is_public AS isPublic, cover_url AS coverUrl, created_at AS createdAt';

function toPlaylist(row) {
  return { ...row, isPublic: Boolean(row.isPublic) };
}

export async function findPlaylistsByUser(userId) {
  const [rows] = await pool.query(
    `SELECT ${playlistColumns} FROM playlists WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(toPlaylist);
}

export async function findPlaylistById(playlistId) {
  const [rows] = await pool.query(`SELECT ${playlistColumns} FROM playlists WHERE id = ?`, [playlistId]);
  return rows[0] ? toPlaylist(rows[0]) : null;
}

export async function insertPlaylist({ userId, name, isPublic, coverUrl }) {
  const [result] = await pool.query(
    'INSERT INTO playlists (user_id, name, is_public, cover_url) VALUES (?, ?, ?, ?)',
    [userId, name, isPublic, coverUrl ?? null]
  );
  return result.insertId;
}

export async function updatePlaylist(playlistId, { name, isPublic, coverUrl }) {
  await pool.query(
    'UPDATE playlists SET name = ?, is_public = ?, cover_url = ? WHERE id = ?',
    [name, isPublic, coverUrl ?? null, playlistId]
  );
}

export async function deletePlaylist(playlistId) {
  await pool.query('DELETE FROM playlists WHERE id = ?', [playlistId]);
}
