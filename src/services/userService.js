import HttpError from '../errors/HttpError.js';
import { ensureFound } from '../utils/ensureFound.js';
import * as userRepository from '../repositories/userRepository.js';
import { fetchPage } from '../utils/pagination.js';

export async function registerUser(userData) {
  const userId = await userRepository.insertUser(userData);
  return userRepository.findUserById(userId);
}

export async function getUserById(userId) {
  return ensureFound(await userRepository.findUserById(userId), 'El usuario no existe');
}

export async function getActiveUserById(userId) {
  const user = await getUserById(userId);

  if (user.status === 'suspended') {
    throw new HttpError(403, 'La cuenta del usuario está suspendida');
  }

  return user;
}

export function listUsers({ search, status, page, limit }) {
  return fetchPage((range) => userRepository.findUsers({ search, status, ...range }), { page, limit });
}

export async function updateUser(userId, changes) {
  await getUserById(userId);
  await userRepository.updateUser(userId, changes);
  return userRepository.findUserById(userId);
}
