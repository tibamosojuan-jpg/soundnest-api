import bcrypt from 'bcryptjs';

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
const bcryptHashPattern = /^\$2[aby]\$\d{2}\$.{53}$/;

export function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, saltRounds);
}

export function verifyPassword(plainPassword, storedHash) {
  return bcrypt.compare(plainPassword, storedHash);
}

export function isPasswordHash(storedValue) {
  return bcryptHashPattern.test(storedValue);
}
