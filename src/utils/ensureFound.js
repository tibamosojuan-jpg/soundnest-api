import HttpError from '../errors/HttpError.js';

export function ensureFound(record, notFoundMessage) {
  if (!record) {
    throw new HttpError(404, notFoundMessage);
  }

  return record;
}
