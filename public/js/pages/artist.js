import { apiClient } from '../apiClient.js';
import { createAlbumCard, createSongRow } from '../components.js';
import { createElement } from '../dom.js';
import { renderAsync, showError, showLoading } from '../feedback.js';
import { renderAppShell } from '../layout.js';

const artistId = new URLSearchParams(window.location.search).get('artistId');

function createSection(title, body) {
  return createElement('section', { className: 'section' }, [
    createElement('h2', { className: 'section-title', text: title }),
    body
  ]);
}

function getReleaseYear(releaseDate) {
  return releaseDate ? String(releaseDate).slice(0, 4) : '';
}

async function loadAlbums() {
  const { data } = await apiClient.get(`/artists/${artistId}/albums`);
  return data;
}

async function loadSongs() {
  const albums = await loadAlbums();
  const songsByAlbum = await Promise.all(
    albums.map(async (album) => (await apiClient.get(`/albums/${album.id}/songs`)).data)
  );
  return songsByAlbum.flat();
}

function renderSongList(songs) {
  const rows = songs.map((song) => createSongRow(song, {
    subtitle: song.albumTitle,
    actions: [createElement('span', { className: 'card-subtitle', text: song.genreName })]
  }));

  return createElement('ul', { className: 'track-list' }, rows);
}

function renderAlbumCards(albums) {
  const cards = albums.map((album) => createAlbumCard(album, getReleaseYear(album.releaseDate)));
  return createElement('div', { className: 'card-grid' }, cards);
}

async function loadHeader(header) {
  showLoading(header, 'Cargando artista...');

  try {
    const { data: artist } = await apiClient.get(`/artists/${artistId}`);
    header.replaceChildren(
      createElement('div', { className: 'artist-info' }, [
        createElement('span', { className: 'album-type', text: 'Artista' }),
        createElement('h1', { text: artist.name }),
        createElement('p', { className: 'artist-bio', text: artist.bio ?? 'Sin biografía disponible' })
      ])
    );
  } catch (error) {
    showError(header, error.message, () => loadHeader(header));
  }
}

const shell = renderAppShell('artists');

if (shell) {
  const { pageContent } = shell;

  if (!artistId) {
    pageContent.append(createElement('div', { className: 'state state-error', text: 'Falta el identificador del artista.' }));
  } else {
    const header = createElement('div', { className: 'artist-hero' });
    const songsBody = createElement('div');
    const albumsBody = createElement('div');

    pageContent.append(
      header,
      createSection('Canciones', songsBody),
      createSection('Álbumes', albumsBody)
    );

    loadHeader(header);

    renderAsync(songsBody, {
      load: loadSongs,
      render: renderSongList,
      emptyMessage: 'Este artista aún no tiene canciones',
      loadingMessage: 'Cargando canciones...'
    });

    renderAsync(albumsBody, {
      load: loadAlbums,
      render: renderAlbumCards,
      emptyMessage: 'Este artista aún no tiene álbumes',
      loadingMessage: 'Cargando álbumes...'
    });
  }
}