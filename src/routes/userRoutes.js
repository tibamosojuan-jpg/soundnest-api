import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import {
  createUserValidator,
  listUsersValidator,
  updateUserValidator,
  userIdValidator
} from '../validators/userValidators.js';

const userRouter = Router();

userRouter.post('/users', createUserValidator, userController.createUser);
userRouter.get('/users', listUsersValidator, userController.getUsers);
userRouter.get('/users/:userId', userIdValidator, userController.getUser);
userRouter.patch('/users/:userId', updateUserValidator, userController.updateUser);

export default userRouter;
