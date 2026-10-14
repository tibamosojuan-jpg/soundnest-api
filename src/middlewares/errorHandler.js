import HttpError from '../errors/HttpError.js';

const duplicateEntryMessages = {
  'users.email': 'El correo ya está registrado',
  'genres.name': 'El género ya existe',
  'songs.uq_songs_album_track': 'Ya existe una canción con ese número de pista en el álbum',
  'playlist_songs.PRIMARY': 'La canción ya está en la playlist',
  'reviews.uq_reviews_user_song': 'El usuario ya publicó una reseña para esta canción'
};

function getDuplicateEntryMessage(error) {
  const [, keyName] = error.sqlMessage.match(/for key '(.+)'/) ?? [];
  return duplicateEntryMessages[keyName] ?? 'El registro ya existe';
}

export default function errorHandler(error, req, res, next) {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido' });
  }

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: getDuplicateEntryMessage(error) });
  }

  console.error(error);
  return res.status(500).json({ message: 'Ocurrió un error interno en el servidor' });
}
