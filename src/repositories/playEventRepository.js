import pool from '../config/database.js';
import { toWhereClause } from '../utils/sql.js';

const playEventSelect = `
  SELECT pe.id, pe.user_id AS userId, pe.song_id AS songId, s.title AS songTitle,
    ar.name AS artistName, pe.played_at AS playedAt, pe.listened_seconds AS listenedSeconds
  FROM play_events pe
  JOIN songs s ON s.id = pe.song_id
  JOIN albums al ON al.id = s.album_id
  JOIN artists ar ON ar.id = al.artist_id`;

export async function insertPlayEvent({ userId, songId, listenedSeconds }) {
  const [result] = await pool.query(
    'INSERT INTO play_events (user_id, song_id, listened_seconds) VALUES (?, ?, ?)',
    [userId, songId, listenedSeconds]
  );
  return result.insertId;
}

export async function findPlayEventById(playEventId) {
  const [rows] = await pool.query(`${playEventSelect} WHERE pe.id = ?`, [playEventId]);
  return rows[0] ?? null;
}

export async function findPlayEventsByUser({ userId, from, to, limit, offset }) {
  const conditions = ['pe.user_id = ?'];
  const values = [userId];

  if (from) {
    conditions.push('pe.played_at >= ?');
    values.push(from);
  }

  if (to) {
    conditions.push('pe.played_at <= ?');
    values.push(to);
  }

  const [rows] = await pool.query(
    `${playEventSelect} ${toWhereClause(conditions)} ORDER BY pe.played_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  return rows;
}

export async function findListeningTotals(userId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS totalPlays, COALESCE(SUM(listened_seconds), 0) AS totalSeconds,
       COUNT(DISTINCT song_id) AS distinctSongs
     FROM play_events
     WHERE user_id = ?`,
    [userId]
  );
  return rows[0];
}
