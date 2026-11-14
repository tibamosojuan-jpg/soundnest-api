import { apiClient, buildQuery } from '../apiClient.js';
import { createElement, formatDuration, getInitial } from '../dom.js';
import { renderAsync, showError, showLoading } from '../feedback.js';
import { createIcon } from '../icons.js';
import { renderAppShell } from '../layout.js';
import { playSong } from '../player.js';

const artistId = new URLSearchParams(window.location.search).get('artistId');

function createSection(title, body) {
  return createElement('section', { className: 'section' }, [
    createElement('h2', { className: 'section-title', text: title }),
    body
  ]);
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
        createElement('div', { className: 'card-subtitle', text: song.albumTitle })
      ]),
      createElement('span', { className: 'card-subtitle', text: song.genreName }),
      createElement('span', { className: 'track-duration', text: formatDuration(song.durationSeconds) })
    ]);
  });

  return createElement('ul', { className: 'track-list' }, rows);
}

function renderAlbumCards(albums) {
  const cards = albums.map((album) => createElement('a', {
    attributes: { href: `/album.html${buildQuery({ albumId: album.id })}` }
  }, [
    createElement('div', { className: 'card' }, [
      createElement('div', { className: 'card-cover', text: getInitial(album.title) }),
      createElement('div', {}, [
        createElement('div', { className: 'card-title', text: album.title }),
        createElement('div', { className: 'card-subtitle', text: album.releaseDate ? String(album.releaseDate).slice(0, 4) : '' })
      ])
    ])
  ]));

  return createElement('div', { className: 'card-grid' }, cards);
}

async function loadHeader(header) {
  showLoading(header, 'Cargando artista...');

  try {
    const { data: artist } = await apiClient.get(`/artists/${artistId}`);
    header.replaceChildren(
      createElement('div', { className: 'card-cover card-cover-round', text: getInitial(artist.name) }),
      createElement('div', {}, [
        createElement('h1', { text: artist.name }),
        createElement('p', { className: 'text-secondary', text: artist.bio ?? 'Sin biografía disponible' })
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
    const header = createElement('div', { className: 'page-header' });
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