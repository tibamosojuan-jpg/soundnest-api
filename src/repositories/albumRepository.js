import pool from '../config/database.js';

const albumColumns = 'id, artist_id AS artistId, title, release_date AS releaseDate, cover_url AS coverUrl, created_at AS createdAt';

export async function findAlbumsByArtist(artistId) {
  const [rows] = await pool.query(
    `SELECT ${albumColumns} FROM albums WHERE artist_id = ? ORDER BY release_date DESC`,
    [artistId]
  );
  return rows;
}

export async function findAlbumById(albumId) {
  const [rows] = await pool.query(`SELECT ${albumColumns} FROM albums WHERE id = ?`, [albumId]);
  return rows[0] ?? null;
}

export async function insertAlbum({ artistId, title, releaseDate, coverUrl }) {
  const [result] = await pool.query(
    'INSERT INTO albums (artist_id, title, release_date, cover_url) VALUES (?, ?, ?, ?)',
    [artistId, title, releaseDate ?? null, coverUrl ?? null]
  );
  return result.insertId;
}

export async function updateAlbum(albumId, { title, releaseDate, coverUrl }) {
  await pool.query(
    'UPDATE albums SET title = ?, release_date = ?, cover_url = ? WHERE id = ?',
    [title, releaseDate ?? null, coverUrl ?? null, albumId]
  );
}
