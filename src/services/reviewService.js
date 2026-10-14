import { ensureFound } from '../utils/ensureFound.js';
import * as reviewRepository from '../repositories/reviewRepository.js';
import * as tagRepository from '../repositories/tagRepository.js';
import { fetchPage } from '../utils/pagination.js';
import { runInTransaction } from '../utils/transaction.js';
import { getActiveUserById } from './userService.js';
import { getAvailableSongById, getSongById } from './songService.js';

async function getReviewById(reviewId) {
  return ensureFound(await reviewRepository.findReviewById(reviewId), 'La reseña no existe');
}

async function attachTags(reviewId, tagNames, connection) {
  const uniqueNames = [...new Set(tagNames)];

  if (!uniqueNames.length) {
    return;
  }

  await tagRepository.insertMissingTags(uniqueNames, connection);
  const tagIds = await tagRepository.findTagIdsByNames(uniqueNames, connection);
  await tagRepository.insertReviewTags(reviewId, tagIds, connection);
}

export async function listSongReviews(songId) {
  await getSongById(songId);
  return reviewRepository.findVisibleReviewsBySong(songId);
}

export function listReviews({ status, page, limit }) {
  return fetchPage((range) => reviewRepository.findReviews({ status, ...range }), { page, limit });
}

export async function publishReview(songId, { tags = [], ...reviewData }) {
  await getAvailableSongById(songId);
  await getActiveUserById(reviewData.userId);

  const reviewId = await runInTransaction(async (connection) => {
    const createdReviewId = await reviewRepository.insertReview({ ...reviewData, songId }, connection);
    await attachTags(createdReviewId, tags, connection);
    return createdReviewId;
  });

  return reviewRepository.findReviewById(reviewId);
}

export async function updateReviewStatus(reviewId, status) {
  await getReviewById(reviewId);
  await reviewRepository.updateReviewStatus(reviewId, status);
  return reviewRepository.findReviewById(reviewId);
}
