import { apiClient, buildQuery } from '../apiClient.js';
import { createElement, getInitial } from '../dom.js';
import { renderAsync } from '../feedback.js';
import { renderAppShell } from '../layout.js';

const artistsLimit = 50;

async function loadArtists() {
  const { data } = await apiClient.get(`/artists${buildQuery({ limit: artistsLimit })}`);
  return data.items.filter((artist) => artist.status === 'active');
}

function renderArtistCards(artists) {
  const cards = artists.map((artist) => createElement('a', {
    attributes: { href: `/artist.html${buildQuery({ artistId: artist.id })}` }
  }, [
    createElement('div', { className: 'card' }, [
      createElement('div', { className: 'card-cover card-cover-round', text: getInitial(artist.name) }),
      createElement('div', {}, [
        createElement('div', { className: 'card-title', text: artist.name }),
        createElement('div', { className: 'card-subtitle', text: 'Artista' })
      ])
    ])
  ]));

  return createElement('div', { className: 'card-grid' }, cards);
}

const shell = renderAppShell('artists');

if (shell) {
  const listContainer = createElement('div');

  shell.pageContent.append(
    createElement('div', { className: 'page-header' }, [
      createElement('div', {}, [
        createElement('h1', { text: 'Artistas' }),
        createElement('p', { className: 'text-secondary', text: 'Descubre a los artistas de SoundNest.' })
      ])
    ]),
    listContainer
  );

  renderAsync(listContainer, {
    load: loadArtists,
    render: renderArtistCards,
    emptyMessage: 'No hay artistas disponibles por ahora',
    loadingMessage: 'Cargando artistas...'
  });
}