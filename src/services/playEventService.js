import HttpError from '../errors/HttpError.js';
import * as playEventRepository from '../repositories/playEventRepository.js';
import { fetchPage } from '../utils/pagination.js';
import { getActiveUserById, getUserById } from './userService.js';
import { getAvailableSongById } from './songService.js';

const secondsPerMinute = 60;

export async function listUserPlayEvents({ userId, from, to, page, limit }) {
  await getUserById(userId);
  return fetchPage(
    (range) => playEventRepository.findPlayEventsByUser({ userId, from, to, ...range }),
    { page, limit }
  );
}

export async function registerPlayEvent(userId, { songId, listenedSeconds }) {
  await getActiveUserById(userId);
  const song = await getAvailableSongById(songId);

  if (listenedSeconds > song.durationSeconds) {
    throw new HttpError(400, 'El tiempo escuchado no puede superar la duración de la canción');
  }

  const playEventId = await playEventRepository.insertPlayEvent({ userId, songId, listenedSeconds });
  return playEventRepository.findPlayEventById(playEventId);
}

export async function getListeningSummary(userId) {
  await getUserById(userId);
  const { totalPlays, totalSeconds, distinctSongs } = await playEventRepository.findListeningTotals(userId);

  return {
    totalPlays,
    totalMinutes: Math.round(Number(totalSeconds) / secondsPerMinute),
    distinctSongs
  };
}
