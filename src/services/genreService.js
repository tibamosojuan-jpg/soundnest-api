import { ensureFound } from '../utils/ensureFound.js';
import * as genreRepository from '../repositories/genreRepository.js';

export function listGenres() {
  return genreRepository.findAllGenres();
}

export async function getGenreById(genreId) {
  return ensureFound(await genreRepository.findGenreById(genreId), 'El género no existe');
}

export async function createGenre({ name }) {
  const genreId = await genreRepository.insertGenre(name);
  return genreRepository.findGenreById(genreId);
}
