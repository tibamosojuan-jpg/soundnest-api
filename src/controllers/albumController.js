import * as albumService from '../services/albumService.js';

export async function getArtistAlbums(req, res) {
  const albums = await albumService.listArtistAlbums(req.params.artistId);
  res.status(200).json({ message: 'Álbumes del artista consultados correctamente', data: albums });
}

export async function getAlbum(req, res) {
  const album = await albumService.getAlbumById(req.params.albumId);
  res.status(200).json({ message: 'Álbum consultado correctamente', data: album });
}

export async function createAlbum(req, res) {
  const album = await albumService.createAlbum(req.params.artistId, req.body);
  res.status(201).json({ message: 'Álbum creado correctamente', data: album });
}

export async function updateAlbum(req, res) {
  const album = await albumService.updateAlbum(req.params.albumId, req.body);
  res.status(200).json({ message: 'Álbum actualizado correctamente', data: album });
}
