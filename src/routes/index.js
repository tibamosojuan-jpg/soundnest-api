import { Router } from 'express';
import userRouter from './userRoutes.js';
import sessionRouter from './sessionRoutes.js';
import genreRouter from './genreRoutes.js';
import artistRouter from './artistRoutes.js';
import albumRouter from './albumRoutes.js';
import songRouter from './songRoutes.js';
import playlistRouter from './playlistRoutes.js';
import reviewRouter from './reviewRoutes.js';
import playEventRouter from './playEventRoutes.js';

const apiRouter = Router();

apiRouter.use(userRouter);
apiRouter.use(sessionRouter);
apiRouter.use(genreRouter);
apiRouter.use(artistRouter);
apiRouter.use(albumRouter);
apiRouter.use(songRouter);
apiRouter.use(playlistRouter);
apiRouter.use(reviewRouter);
apiRouter.use(playEventRouter);

export default apiRouter;
