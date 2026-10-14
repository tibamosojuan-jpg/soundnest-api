import { Router } from 'express';
import * as playEventController from '../controllers/playEventController.js';
import { userIdValidator } from '../validators/userValidators.js';
import { createPlayEventValidator, listPlayEventsValidator } from '../validators/playEventValidators.js';

const playEventRouter = Router();

playEventRouter.get('/users/:userId/play-events', listPlayEventsValidator, playEventController.getUserPlayEvents);
playEventRouter.post('/users/:userId/play-events', createPlayEventValidator, playEventController.createPlayEvent);
playEventRouter.get('/users/:userId/play-events/summary', userIdValidator, playEventController.getListeningSummary);

export default playEventRouter;
