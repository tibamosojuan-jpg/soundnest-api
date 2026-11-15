import { apiClient, buildQuery } from '../apiClient.js';
import { createSongRow } from '../components.js';
import { createElement } from '../dom.js';
import { confirmAction, renderAsync, showError, showToast } from '../feedback.js';
import { renderAppShell } from '../layout.js';
import { playSong } from '../player.js';

const songsCatalogLimit = 100;

async function fetchPlaylist(playlistId) {
  const { data } = await apiClient.get(`/playlists/${playlistId}`);
  return data;
}

async function playSongById(songId) {
  try {
    const { data: song } = await apiClient.get(`/songs/${songId}`);
    playSong(song);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function createEditForm(playlist, onSaved) {
  const nameInput = createElement('input', {
    attributes: { type: 'text', name: 'name', maxlength: '100', required: '', value: playlist.name }
  });
  const publicCheckbox = createElement('input', { attributes: { type: 'checkbox', name: 'isPublic' } });
  publicCheckbox.checked = playlist.isPublic;

  const submitButton = createElement('button', { className: 'button button-primary', text: 'Guardar cambios', attributes: { type: 'submit' } });
  const form = createElement('form', { className: 'form-inline' }, [
    createElement('label', {}, ['Nombre ', nameInput]),
    createElement('label', {}, [publicCheckbox, ' Pública']),
    submitButton
  ]);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();

    if (!name) {
      showToast('El nombre de la playlist es obligatorio', 'error');
      return;
    }

    submitButton.disabled = true;

    try {
      await apiClient.put(`/playlists/${playlist.id}`, { name, isPublic: publicCheckbox.checked });
      showToast('Playlist actualizada');
      onSaved();
    } catch (error) {
      showToast(error.message, 'error');
      submitButton.disabled = false;
    }
  });

  return form;
}

async function removeSong(playlist, song, onChanged) {
  const isConfirmed = await confirmAction(`¿Quitar "${song.title}" de la playlist?`, 'Quitar');

  if (!isConfirmed) {
    return;
  }

  try {
    await apiClient.delete(`/playlists/${playlist.id}/songs/${song.songId}`);
    showToast('Canción quitada de la playlist');
    onChanged();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function createSongList(playlist, onChanged) {
  if (playlist.songs.length === 0) {
    return createElement('div', { className: 'state', text: 'Esta playlist todavía no tiene canciones.' });
  }

  const rows = playlist.songs.map((song) => {
    const removeButton = createElement('button', {
      className: 'button button-secondary',
      text: 'Quitar',
      attributes: { type: 'button' }
    });
    removeButton.addEventListener('click', () => removeSong(playlist, song, onChanged));

    return createSongRow(song, {
      onPlay: () => playSongById(song.songId),
      actions: [removeButton]
    });
  });

  return createElement('ul', { className: 'track-list' }, rows);
}

function createAddSongForm(songs, playlist, onChanged) {
  const select = createElement('select', { attributes: { name: 'songId', required: '' } },
    songs.map((song) => createElement('option', {
      text: `${song.title} · ${song.artistName}`,
      attributes: { value: String(song.id) }
    }))
  );
  const submitButton = createElement('button', { className: 'button button-primary', text: 'Agregar', attributes: { type: 'submit' } });
  const form = createElement('form', { className: 'form-inline' }, [select, submitButton]);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submitButton.disabled = true;

    try {
      await apiClient.post(`/playlists/${playlist.id}/songs`, { songId: Number(select.value) });
      showToast('Canción agregada a la playlist');
      onChanged();
    } catch (error) {
      showToast(error.message, 'error');
      submitButton.disabled = false;
    }
  });

  return form;
}

function createAddSongSection(playlist, onChanged) {
  const container = createElement('div');

  const loadSongs = async () => {
    const { data } = await apiClient.get(`/songs${buildQuery({ limit: songsCatalogLimit })}`);
    const songIdsInPlaylist = new Set(playlist.songs.map((song) => song.songId));
    return data.items.filter((song) => !songIdsInPlaylist.has(song.id));
  };

  renderAsync(container, {
    load: loadSongs,
    render: (songs) => createAddSongForm(songs, playlist, onChanged),
    emptyMessage: 'Todas las canciones disponibles ya están en esta playlist.',
    loadingMessage: 'Cargando canciones...'
  });

  return container;
}

function createPlaylistView(playlist, onChanged) {
  return createElement('div', {}, [
    createElement('div', { className: 'page-header' }, [
      createElement('div', {}, [
        createElement('h1', { text: playlist.name }),
        createElement('p', {
          className: 'text-secondary',
          text: `${playlist.isPublic ? 'Pública' : 'Privada'} · ${playlist.songs.length} canciones`
        })
      ]),
      createElement('a', { className: 'button button-secondary', text: 'Volver a mis playlists', attributes: { href: '/playlists.html' } })
    ]),
    createElement('section', { className: 'section' }, [
      createElement('h2', { className: 'section-title', text: 'Editar playlist' }),
      createEditForm(playlist, onChanged)
    ]),
    createElement('section', { className: 'section' }, [
      createElement('h2', { className: 'section-title', text: 'Canciones' }),
      createSongList(playlist, onChanged)
    ]),
    createElement('section', { className: 'section' }, [
      createElement('h2', { className: 'section-title', text: 'Agregar canción' }),
      createAddSongSection(playlist, onChanged)
    ])
  ]);
}

function renderPlaylistPage(container, playlistId) {
  const loadAndRender = () => renderAsync(container, {
    load: async () => [await fetchPlaylist(playlistId)],
    render: ([playlist]) => createPlaylistView(playlist, loadAndRender),
    emptyMessage: 'La playlist no existe.',
    loadingMessage: 'Cargando playlist...'
  });

  loadAndRender();
}

const playlistId = new URLSearchParams(window.location.search).get('playlistId');
const shell = renderAppShell('playlists');

if (shell) {
  if (playlistId) {
    renderPlaylistPage(shell.pageContent, playlistId);
  } else {
    showError(shell.pageContent, 'No se indicó la playlist que quieres abrir.');
  }
}