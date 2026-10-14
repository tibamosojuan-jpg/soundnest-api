import { Router } from 'express';
import * as sessionController from '../controllers/sessionController.js';
import { createSessionValidator } from '../validators/sessionValidators.js';

const sessionRouter = Router();

sessionRouter.post('/sessions', createSessionValidator, sessionController.createSession);

export default sessionRouter;
