import * as reviewService from '../services/reviewService.js';

export async function getSongReviews(req, res) {
  const reviews = await reviewService.listSongReviews(req.params.songId);
  res.status(200).json({ message: 'Reseñas de la canción consultadas correctamente', data: reviews });
}

export async function getReviews(req, res) {
  const reviewsPage = await reviewService.listReviews(req.query);
  res.status(200).json({ message: 'Reseñas consultadas correctamente', data: reviewsPage });
}

export async function createReview(req, res) {
  const review = await reviewService.publishReview(req.params.songId, req.body);
  res.status(201).json({ message: 'Reseña publicada correctamente', data: review });
}

export async function updateReview(req, res) {
  const review = await reviewService.updateReviewStatus(req.params.reviewId, req.body.status);
  res.status(200).json({ message: 'Estado de la reseña actualizado correctamente', data: review });
}
