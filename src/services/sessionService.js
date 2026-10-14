import HttpError from '../errors/HttpError.js';
import * as userRepository from '../repositories/userRepository.js';
import { getActiveUserById } from './userService.js';

export async function createSession({ email, password }) {
  const credentials = await userRepository.findCredentialsByEmail(email);

  if (!credentials || credentials.password !== password) {
    throw new HttpError(401, 'El correo o la contraseña son incorrectos');
  }

  return getActiveUserById(credentials.id);
}
