import { apiClient } from '../apiClient.js';
import { createElement, getInitial } from '../dom.js';
import { confirmAction, renderAsync, showToast } from '../feedback.js';
import { renderAppShell } from '../layout.js';

const shell = renderAppShell('playlists');

if (shell) {
  const { user, pageContent } = shell;
  const listContainer = createElement('div');
  const filterButtons = {};
  let allPlaylists = null;
  let currentFilter = 'all';

  async function fetchPlaylists() {
    const { data } = await apiClient.get(`/users/${user.id}/playlists`);
    allPlaylists = data;
  }

  function getVisiblePlaylists() {
    if (currentFilter === 'public') {
      return allPlaylists.filter((playlist) => playlist.isPublic);
    }

    if (currentFilter === 'private') {
      return allPlaylists.filter((playlist) => !playlist.isPublic);
    }

    return allPlaylists;
  }

  async function loadVisiblePlaylists() {
    if (!allPlaylists) {
      await fetchPlaylists();
    }

    return getVisiblePlaylists();
  }

  function refreshList() {
    renderAsync(listContainer, {
      load: loadVisiblePlaylists,
      render: renderPlaylistCards,
      emptyMessage: 'No hay playlists en esta categoría',
      loadingMessage: 'Cargando playlists...'
    });
  }

  function setFilter(filter) {
    currentFilter = filter;

    Object.entries(filterButtons).forEach(([key, button]) => {
      button.className = key === filter ? 'button button-primary' : 'button button-secondary';
    });

    refreshList();
  }

  async function deletePlaylist(playlist) {
    const confirmed = await confirmAction(`¿Eliminar la playlist "${playlist.name}"?`, 'Eliminar');

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(`/playlists/${playlist.id}`);
      showToast('Playlist eliminada');
      allPlaylists = null;
      refreshList();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  function renderPlaylistCards(playlists) {
    const cards = playlists.map((playlist) => {
      const deleteButton = createElement('button', {
        className: 'button button-secondary',
        text: 'Eliminar',
        attributes: { type: 'button' }
      });
      deleteButton.addEventListener('click', () => deletePlaylist(playlist));

      return createElement('div', { className: 'card' }, [
        createElement('div', { className: 'card-cover', text: getInitial(playlist.name) }),
        createElement('div', {}, [
          createElement('div', { className: 'card-title', text: playlist.name }),
          createElement('div', { className: 'card-subtitle', text: playlist.isPublic ? 'Pública' : 'Privada' })
        ]),
        deleteButton
      ]);
    });

    return createElement('div', { className: 'card-grid' }, cards);
  }

  // Formulario para crear playlist
  const nameInput = createElement('input', {
    attributes: {
      type: 'text',
      maxlength: '100',
      required: 'required',
      placeholder: 'Nombre de la playlist',
      'aria-label': 'Nombre de la playlist'
    }
  });
  const publicCheckbox = createElement('input', { attributes: { type: 'checkbox' } });
  const cancelButton = createElement('button', {
    className: 'button button-secondary',
    text: 'Cancelar',
    attributes: { type: 'button' }
  });
  const saveButton = createElement('button', {
    className: 'button button-primary',
    text: 'Guardar',
    attributes: { type: 'submit' }
  });
  const createForm = createElement('form', { className: 'create-playlist-form' }, [
    nameInput,
    createElement('label', {}, [publicCheckbox, ' Pública']),
    createElement('div', {}, [cancelButton, saveButton])
  ]);
  createForm.hidden = true;

  const createButton = createElement('button', {
    className: 'button button-primary',
    text: '+ Crear playlist',
    attributes: { type: 'button' }
  });

  createButton.addEventListener('click', () => {
    createForm.hidden = !createForm.hidden;

    if (!createForm.hidden) {
      nameInput.focus();
    }
  });

  cancelButton.addEventListener('click', () => {
    createForm.reset();
    createForm.hidden = true;
  });

  createForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    saveButton.disabled = true;

    try {
      await apiClient.post(`/users/${user.id}/playlists`, {
        name: nameInput.value.trim(),
        isPublic: publicCheckbox.checked
      });
      showToast('Playlist creada');
      createForm.reset();
      createForm.hidden = true;
      allPlaylists = null;
      refreshList();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      saveButton.disabled = false;
    }
  });

  // Filtros
  const filterOptions = [
    ['all', 'Todas'],
    ['public', 'Públicas'],
    ['private', 'Privadas']
  ];
  const filterRow = createElement('div', { className: 'filter-row' }, filterOptions.map(([key, label]) => {
    const button = createElement('button', {
      className: 'button button-secondary',
      text: label,
      attributes: { type: 'button' }
    });
    button.addEventListener('click', () => setFilter(key));
    filterButtons[key] = button;
    return button;
  }));

  pageContent.append(
    createElement('div', { className: 'page-header' }, [
      createElement('div', {}, [
        createElement('h1', { text: 'Mis playlists' }),
        createElement('p', { className: 'text-secondary', text: 'Organiza tus canciones favoritas.' })
      ]),
      createButton
    ]),
    filterRow,
    createForm,
    listContainer
  );

  setFilter('all');
}