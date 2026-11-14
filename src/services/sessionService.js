import HttpError from '../errors/HttpError.js';
import * as userRepository from '../repositories/userRepository.js';
import { verifyPassword } from '../utils/passwordHasher.js';
import { getActiveUserById } from './userService.js';

export async function createSession({ email, password }) {
  const credentials = await userRepository.findCredentialsByEmail(email);
  const isValidPassword = credentials !== null && await verifyPassword(password, credentials.password);

  if (!isValidPassword) {
    throw new HttpError(401, 'El correo o la contraseña son incorrectos');
  }

  return getActiveUserById(credentials.id);
}
