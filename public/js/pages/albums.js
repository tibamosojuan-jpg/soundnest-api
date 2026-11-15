import { apiClient, buildQuery } from '../apiClient.js';
import { createAlbumCard } from '../components.js';
import { createElement } from '../dom.js';
import { renderAsync } from '../feedback.js';
import { renderAppShell } from '../layout.js';

const artistsLimit = 50;

async function loadAlbums() {
  const { data } = await apiClient.get(`/artists${buildQuery({ limit: artistsLimit })}`);
  const activeArtists = data.items.filter((artist) => artist.status === 'active');

  const albumsByArtist = await Promise.all(
    activeArtists.map(async (artist) => {
      const { data: albums } = await apiClient.get(`/artists/${artist.id}/albums`);
      return albums.map((album) => ({ ...album, artistName: artist.name }));
    })
  );

  return albumsByArtist.flat();
}

function renderAlbumCards(albums) {
  const cards = albums.map((album) => createAlbumCard(album, album.artistName));
  return createElement('div', { className: 'card-grid' }, cards);
}

const shell = renderAppShell('albums');

if (shell) {
  const listContainer = createElement('div');

  shell.pageContent.append(
    createElement('div', { className: 'page-header' }, [
      createElement('div', {}, [
        createElement('h1', { text: 'Álbumes' }),
        createElement('p', { className: 'text-secondary', text: 'Explora los álbumes de SoundNest.' })
      ])
    ]),
    listContainer
  );

  renderAsync(listContainer, {
    load: loadAlbums,
    render: renderAlbumCards,
    emptyMessage: 'No hay álbumes disponibles por ahora',
    loadingMessage: 'Cargando álbumes...'
  });
}