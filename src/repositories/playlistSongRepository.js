import pool from '../config/database.js';

export async function findSongsByPlaylist(playlistId) {
  const [rows] = await pool.query(
    `SELECT ps.position, ps.added_at AS addedAt, s.id AS songId, s.title,
       s.duration_seconds AS durationSeconds, ar.name AS artistName
     FROM playlist_songs ps
     JOIN songs s ON s.id = ps.song_id
     JOIN albums al ON al.id = s.album_id
     JOIN artists ar ON ar.id = al.artist_id
     WHERE ps.playlist_id = ?
     ORDER BY ps.position`,
    [playlistId]
  );
  return rows;
}

export async function findNextPosition(playlistId) {
  const [rows] = await pool.query(
    'SELECT COALESCE(MAX(position), 0) + 1 AS nextPosition FROM playlist_songs WHERE playlist_id = ?',
    [playlistId]
  );
  return rows[0].nextPosition;
}

export async function insertPlaylistSong(playlistId, songId, position) {
  await pool.query(
    'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)',
    [playlistId, songId, position]
  );
}

export async function deletePlaylistSong(playlistId, songId) {
  const [result] = await pool.query(
    'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
    [playlistId, songId]
  );
  return result.affectedRows;
}
