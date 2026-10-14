import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { songIdValidator } from '../validators/songValidators.js';
import {
  createReviewValidator,
  listReviewsValidator,
  updateReviewValidator
} from '../validators/reviewValidators.js';

const reviewRouter = Router();

reviewRouter.get('/songs/:songId/reviews', songIdValidator, reviewController.getSongReviews);
reviewRouter.post('/songs/:songId/reviews', createReviewValidator, reviewController.createReview);
reviewRouter.get('/reviews', listReviewsValidator, reviewController.getReviews);
reviewRouter.patch('/reviews/:reviewId', updateReviewValidator, reviewController.updateReview);

export default reviewRouter;
