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
    image.className = 'card-cover';
    image.src = album.coverUrl;
    image.alt = album.title;
    return image;
  }

  return createElement('div', { className: 'card-cover', text: getInitial(album.title) });
}

function renderHeader(album, artist, songs) {
  const totalSeconds = songs.reduce((total, song) => total + song.durationSeconds, 0);
  const year = album.releaseDate ? String(album.releaseDate).slice(0, 4) : '';

  return createElement('div', { className: 'page-header' }, [
    createCover(album),
    createElement('div', {}, [
      createElement('h1', { text: album.title }),
      createElement('p', { className: 'text-secondary', text: artist.name }),
      createElement('p', { className: 'card-subtitle', text: `${year} · ${songs.length} canciones · ${formatTotalDuration(totalSeconds)}` })
    ])
  ]);
}

function renderTrackList(songs) {
  const rows = songs.map((song) => {
    const playButton = createElement('button', {
      className: 'icon-button',
      attributes: { type: 'button', 'aria-label': `Reproducir ${song.title}` }
    }, [createIcon('play')]);
    playButton.addEventListener('click', () => playSong(song));

    return createElement('li', { className: 'track-row' }, [
      createElement('span', { className: 'track-duration', text: String(song.trackNumber) }),
      createElement('div', { className: 'track-meta' }, [
        createElement('div', { className: 'card-title', text: song.title })
      ]),
      playButton,
      createElement('span', { className: 'track-duration', text: formatDuration(song.durationSeconds) })
    ]);
  });

  return createElement('ul', { className: 'track-list' }, rows);
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