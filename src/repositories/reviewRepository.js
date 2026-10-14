import pool from '../config/database.js';
import { toWhereClause } from '../utils/sql.js';

const reviewSelect = `
  SELECT r.id, r.song_id AS songId, s.title AS songTitle, r.user_id AS userId, u.name AS userName,
    r.rating, r.comment, r.listen_count AS listenCount, r.status, r.created_at AS createdAt,
    GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ',') AS tags
  FROM reviews r
  JOIN users u ON u.id = r.user_id
  JOIN songs s ON s.id = r.song_id
  LEFT JOIN review_tags rt ON rt.review_id = r.id
  LEFT JOIN tags t ON t.id = rt.tag_id`;
const reviewGrouping = 'GROUP BY r.id, s.title, u.name';

function toReview(row) {
  return { ...row, tags: row.tags ? row.tags.split(',') : [] };
}

export async function findReviewById(reviewId) {
  const [rows] = await pool.query(`${reviewSelect} WHERE r.id = ? ${reviewGrouping}`, [reviewId]);
  return rows[0] ? toReview(rows[0]) : null;
}

export async function findVisibleReviewsBySong(songId) {
  const [rows] = await pool.query(
    `${reviewSelect} WHERE r.song_id = ? AND r.status = 'visible' ${reviewGrouping} ORDER BY r.created_at DESC`,
    [songId]
  );
  return rows.map(toReview);
}

export async function findReviews({ status, limit, offset }) {
  const conditions = [];
  const values = [];

  if (status) {
    conditions.push('r.status = ?');
    values.push(status);
  }

  const [rows] = await pool.query(
    `${reviewSelect} ${toWhereClause(conditions)} ${reviewGrouping} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  return rows.map(toReview);
}

export async function insertReview({ userId, songId, rating, comment, listenCount }, executor = pool) {
  const [result] = await executor.query(
    'INSERT INTO reviews (user_id, song_id, rating, comment, listen_count) VALUES (?, ?, ?, ?, ?)',
    [userId, songId, rating, comment ?? null, listenCount ?? null]
  );
  return result.insertId;
}

export async function updateReviewStatus(reviewId, status) {
  await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, reviewId]);
}
