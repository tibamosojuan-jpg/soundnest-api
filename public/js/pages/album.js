import { apiClient } from '../apiClient.js';
import { createElement, formatDuration, getInitial } from '../dom.js';
import { showError, showLoading } from '../feedback.js';
import { createIcon } from '../icons.js';
import { renderAppShell } from '../layout.js';
import { playSong } from '../player.js';

const albumId = new URLSearchParams(window.location.search).get('albumId');

function formatTotalDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

function createCover(album) {
  if (album.coverUrl) {
    const image = document.createElement('img');
    image.className = 'album-cover';
    image.src = album.coverUrl;
    image.alt = album.title;
    return image;
  }

  return createElement('div', { className: 'album-cover', text: getInitial(album.title) });
}

function renderHeader(album, artist, songs) {
  const totalSeconds = songs.reduce((total, song) => total + song.durationSeconds, 0);
  const year = album.releaseDate ? String(album.releaseDate).slice(0, 4) : '';

  const playAllButton = createElement('button', {
    className: 'button-green',
    attributes: { type: 'button', 'aria-label': 'Reproducir álbum' }
  }, [createIcon('play')]);
  playAllButton.addEventListener('click', () => {
    if (songs.length > 0) {
      playSong(songs[0]);
    }
  });

  return createElement('div', { className: 'album-hero' }, [
    createCover(album),
    createElement('div', { className: 'album-info' }, [
      createElement('span', { className: 'album-type', text: 'Álbum' }),
      createElement('h1', { text: album.title }),
      createElement('p', { className: 'album-artist', text: artist.name }),
      createElement('p', { className: 'card-subtitle', text: `${year} · ${songs.length} canciones · ${formatTotalDuration(totalSeconds)}` }),
      createElement('div', { className: 'album-actions' }, [playAllButton])
    ])
  ]);
}

function renderTrackList(songs) {
  const header = createElement('li', { className: 'track-header' }, [
    createElement('span', { text: '#' }),
    createElement('span', { text: 'Título' }),
    createElement('span', { className: 'track-duration', text: 'Duración' })
  ]);

  const rows = songs.map((song) => {
    const row = createElement('li', { className: 'album-track' }, [
      createElement('span', { className: 'track-number', text: String(song.trackNumber) }),
      createElement('span', { className: 'track-title', text: song.title }),
      createElement('span', { className: 'track-duration', text: formatDuration(song.durationSeconds) })
    ]);
    row.addEventListener('click', () => playSong(song));
    return row;
  });

  return createElement('ul', { className: 'album-tracks' }, [header, ...rows]);
}

async function renderAlbumPage(pageContent) {
  showLoading(pageContent, 'Cargando álbum...');

  try {
    const [{ data: album }, { data: songs }] = await Promise.all([
      apiClient.get(`/albums/${albumId}`),
      apiClient.get(`/albums/${albumId}/songs`)
    ]);
    const { data: artist } = await apiClient.get(`/artists/${album.artistId}`);

    pageContent.replaceChildren(
      renderHeader(album, artist, songs),
      songs.length === 0
        ? createElement('div', { className: 'state', text: 'Este álbum aún no tiene canciones' })
        : renderTrackList(songs)
    );
  } catch (error) {
    showError(pageContent, error.message, () => renderAlbumPage(pageContent));
  }
}

const shell = renderAppShell('albums');

if (shell) {
  if (!albumId) {
    shell.pageContent.append(createElement('div', { className: 'state state-error', text: 'Falta el identificador del álbum.' }));
  } else {
    renderAlbumPage(shell.pageContent);
  }
}