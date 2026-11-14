import { apiClient, buildQuery } from '../apiClient.js';
import { createElement, formatDuration } from '../dom.js';
import { renderAsync } from '../feedback.js';
import { createIcon } from '../icons.js';
import { renderAppShell } from '../layout.js';
import { playSong } from '../player.js';

const songsLimit = 50;

async function loadSongs() {
  const { data } = await apiClient.get(`/songs${buildQuery({ limit: songsLimit })}`);
  return data.items;
}

function renderSongList(songs) {
  const rows = songs.map((song) => {
    const playButton = createElement('button', {
      className: 'icon-button',
      attributes: { type: 'button', 'aria-label': `Reproducir ${song.title}` }
    }, [createIcon('play')]);
    playButton.addEventListener('click', () => playSong(song));

    return createElement('li', { className: 'track-row' }, [
      playButton,
      createElement('div', { className: 'track-meta' }, [
        createElement('div', { className: 'card-title', text: song.title }),
        createElement('div', { className: 'card-subtitle', text: `${song.artistName} · ${song.albumTitle}` })
      ]),
      createElement('span', { className: 'card-subtitle', text: song.genreName }),
      createElement('span', { className: 'track-duration', text: formatDuration(song.durationSeconds) })
    ]);
  });

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