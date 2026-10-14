import * as genreService from '../services/genreService.js';

export async function getGenres(req, res) {
  const genres = await genreService.listGenres();
  res.status(200).json({ message: 'Géneros consultados correctamente', data: genres });
}

export async function createGenre(req, res) {
  const genre = await genreService.createGenre(req.body);
  res.status(201).json({ message: 'Género creado correctamente', data: genre });
}
