import { apiClient, buildQuery } from '../apiClient.js';
import { createSongRow } from '../components.js';
import { createElement } from '../dom.js';
import { renderAsync } from '../feedback.js';
import { renderAppShell } from '../layout.js';

const songsLimit = 50;

async function loadSongs() {
  const { data } = await apiClient.get(`/songs${buildQuery({ limit: songsLimit })}`);
  return data.items;
}

function createReviewLink(song) {
  return createElement('a', {
    className: 'button button-secondary',
    text: 'Reseñar',
    attributes: { href: `/reviews.html${buildQuery({ songId: song.id })}` }
  });
}

function renderSongList(songs) {
  const rows = songs.map((song) => createSongRow(song, {
    subtitle: `${song.artistName} · ${song.albumTitle}`,
    actions: [
      createElement('span', { className: 'card-subtitle', text: song.genreName }),
      createReviewLink(song)
    ]
  }));

  return createElement('ul', { className: 'track-list' }, rows);
}

const shell = renderAppShell('songs');

if (shell) {
  const listContainer = createElement('div');

  shell.pageContent.append(
    createElement('div', { className: 'page-header' }, [
      createElement('div', {}, [
        createElement('h1', { text: 'Canciones' }),
        createElement('p', { className: 'text-secondary', text: 'Explora el catálogo completo de SoundNest.' })
      ])
    ]),
    listContainer
  );

  renderAsync(listContainer, {
    load: loadSongs,
    render: renderSongList,
    emptyMessage: 'No hay canciones disponibles',
    loadingMessage: 'Cargando canciones...'
  });
}