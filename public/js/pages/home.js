import { apiClient, buildQuery } from '../apiClient.js';
import { createSongRow } from '../components.js';
import { createElement, getInitial } from '../dom.js';
import { renderAsync } from '../feedback.js';
import { renderAppShell } from '../layout.js';
import { playEventRegisteredEvent, playSongById } from '../player.js';

const recentSongsLimit = 6;
const recentPlayEventsLimit = 30;
const featuredSongsLimit = 8;
const featuredArtistsLimit = 6;

function getGreeting() {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return 'Buenos días';
  }

  return currentHour < 19 ? 'Buenas tardes' : 'Buenas noches';
}

function createSection(title) {
  const body = createElement('div');
  const section = createElement('section', { className: 'section' }, [
    createElement('h2', { className: 'section-title', text: title }),
    body
  ]);
  return { section, body };
}

function createCard({ title, subtitle, isRound = false }) {
  return createElement('div', { className: 'card' }, [
    createElement('div', { className: isRound ? 'card-cover card-cover-round' : 'card-cover', text: getInitial(title) }),
    createElement('div', {}, [
      createElement('div', { className: 'card-title', text: title }),
      createElement('div', { className: 'card-subtitle', text: subtitle })
    ])
  ]);
}

async function loadRecentSongs(userId) {
  const { data } = await apiClient.get(`/users/${userId}/play-events${buildQuery({ limit: recentPlayEventsLimit })}`);
  const uniqueSongs = new Map();

  data.items.forEach((playEvent) => {
    if (!uniqueSongs.has(playEvent.songId)) {
      uniqueSongs.set(playEvent.songId, playEvent);
    }
  });

  return [...uniqueSongs.values()].slice(0, recentSongsLimit);
}

function renderRecentSongs(playEvents) {
  const cards = playEvents.map((playEvent) => {
    const card = createCard({ title: playEvent.songTitle, subtitle: playEvent.artistName });
    const button = createElement('button', { className: 'card-button', attributes: { type: 'button', 'aria-label': `Reproducir ${playEvent.songTitle}` } }, [card]);
    button.addEventListener('click', () => playSongById(playEvent.songId));
    return button;
  });

  return createElement('div', { className: 'card-grid' }, cards);
}

async function loadFeaturedSongs() {
  const { data } = await apiClient.get(`/songs${buildQuery({ limit: featuredSongsLimit })}`);
  return data.items;
}

function renderSongRows(songs) {
  const rows = songs.map((song) => createSongRow(song, {
    subtitle: `${song.artistName} · ${song.albumTitle}`,
    actions: [createElement('span', { className: 'card-subtitle', text: song.genreName })]
  }));

  return createElement('ul', { className: 'track-list' }, rows);
}

async function loadFeaturedArtists() {
  const { data } = await apiClient.get(`/artists${buildQuery({ limit: featuredArtistsLimit })}`);
  return data.items.filter((artist) => artist.status === 'active');
}

function renderArtists(artists) {
  const cards = artists.map((artist) => createElement('a', { attributes: { href: `/artist.html${buildQuery({ artistId: artist.id })}` } }, [
    createCard({ title: artist.name, subtitle: 'Artista', isRound: true })
  ]));

  return createElement('div', { className: 'card-grid' }, cards);
}

function renderHomePage() {
  const shell = renderAppShell('home');

  if (!shell) {
    return;
  }

  const { user, pageContent } = shell;
  const recentSection = createSection('Escuchado recientemente');
  const songsSection = createSection('Canciones para ti');
  const artistsSection = createSection('Artistas recomendados');

  pageContent.append(
    createElement('div', { className: 'page-header' }, [
      createElement('div', {}, [
        createElement('h1', { text: `${getGreeting()}, ${user.name.split(' ')[0]}` }),
        createElement('p', { className: 'text-secondary', text: 'Esto es lo que tenemos para ti hoy.' })
      ])
    ]),
    recentSection.section,
    songsSection.section,
    artistsSection.section
  );

  const renderRecentSection = () => renderAsync(recentSection.body, {
    load: () => loadRecentSongs(user.id),
    render: renderRecentSongs,
    emptyMessage: 'Aún no has escuchado nada. Dale play a una canción para empezar tu historial.',
    loadingMessage: 'Cargando tu historial...'
  });

  renderRecentSection();
  window.addEventListener(playEventRegisteredEvent, renderRecentSection);

  renderAsync(songsSection.body, {
    load: loadFeaturedSongs,
    render: renderSongRows,
    emptyMessage: 'No hay canciones disponibles por ahora.',
    loadingMessage: 'Cargando canciones...'
  });

  renderAsync(artistsSection.body, {
    load: loadFeaturedArtists,
    render: renderArtists,
    emptyMessage: 'No hay artistas disponibles por ahora.',
    loadingMessage: 'Cargando artistas...'
  });
}

renderHomePage();
