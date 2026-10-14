import * as artistService from '../services/artistService.js';

export async function getArtists(req, res) {
  const artistsPage = await artistService.listArtists(req.query);
  res.status(200).json({ message: 'Artistas consultados correctamente', data: artistsPage });
}

export async function getArtist(req, res) {
  const artist = await artistService.getArtistById(req.params.artistId);
  res.status(200).json({ message: 'Artista consultado correctamente', data: artist });
}

export async function createArtist(req, res) {
  const artist = await artistService.createArtist(req.body);
  res.status(201).json({ message: 'Artista creado correctamente', data: artist });
}

export async function updateArtist(req, res) {
  const artist = await artistService.updateArtist(req.params.artistId, req.body);
  res.status(200).json({ message: 'Artista actualizado correctamente', data: artist });
}
