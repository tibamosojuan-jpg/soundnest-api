import pool from '../config/database.js';
import { toWhereClause } from '../utils/sql.js';

const songSelect = `
  SELECT s.id, s.title, s.duration_seconds AS durationSeconds, s.track_number AS trackNumber,
    s.audio_url AS audioUrl, s.status, s.album_id AS albumId, al.title AS albumTitle,
    al.artist_id AS artistId, ar.name AS artistName, s.genre_id AS genreId, g.name AS genreName
  FROM songs s
  JOIN albums al ON al.id = s.album_id
  JOIN artists ar ON ar.id = al.artist_id
  JOIN genres g ON g.id = s.genre_id`;

export async function findSongById(songId) {
  const [rows] = await pool.query(`${songSelect} WHERE s.id = ?`, [songId]);
  return rows[0] ?? null;
}

export async function findActiveSongsByAlbum(albumId) {
  const [rows] = await pool.query(
    `${songSelect} WHERE s.album_id = ? AND s.status = 'active' ORDER BY s.track_number`,
    [albumId]
  );
  return rows;
}

export async function searchActiveSongs({ title, genreId, limit, offset }) {
  const conditions = ["s.status = 'active'"];
  const values = [];

  if (title) {
    conditions.push('s.title LIKE ?');
    values.push(`%${title}%`);
  }

  if (genreId) {
    conditions.push('s.genre_id = ?');
    values.push(genreId);
  }

  const [rows] = await pool.query(
    `${songSelect} ${toWhereClause(conditions)} ORDER BY s.title LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  return rows;
}

export async function insertSong({ albumId, genreId, title, durationSeconds, trackNumber, audioUrl }) {
  const [result] = await pool.query(
    `INSERT INTO songs (album_id, genre_id, title, duration_seconds, track_number, audio_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [albumId, genreId, title, durationSeconds, trackNumber, audioUrl ?? null]
  );
  return result.insertId;
}

export async function updateSong(songId, { genreId, title, durationSeconds, trackNumber, audioUrl, status }) {
  await pool.query(
    `UPDATE songs
     SET genre_id = ?, title = ?, duration_seconds = ?, track_number = ?, audio_url = ?, status = ?
     WHERE id = ?`,
    [genreId, title, durationSeconds, trackNumber, audioUrl ?? null, status, songId]
  );
}
