import { ensureFound } from '../utils/ensureFound.js';
import * as artistRepository from '../repositories/artistRepository.js';
import { fetchPage } from '../utils/pagination.js';

export function listArtists({ page, limit }) {
  return fetchPage((range) => artistRepository.findArtists(range), { page, limit });
}

export async function getArtistById(artistId) {
  return ensureFound(await artistRepository.findArtistById(artistId), 'El artista no existe');
}

export async function createArtist(artistData) {
  const artistId = await artistRepository.insertArtist(artistData);
  return artistRepository.findArtistById(artistId);
}

export async function updateArtist(artistId, artistData) {
  await getArtistById(artistId);
  await artistRepository.updateArtist(artistId, artistData);
  return artistRepository.findArtistById(artistId);
}
