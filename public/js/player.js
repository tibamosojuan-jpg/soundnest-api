import { apiClient } from './apiClient.js';
import { createElement, formatDuration } from './dom.js';
import { createIcon } from './icons.js';
import { getCurrentUser } from './session.js';
import { showToast } from './feedback.js';

export const playEventRegisteredEvent = 'soundnest:play-event-registered';
const tickIntervalMs = 1000;
const statusResetDelayMs = 3000;

const playerState = {
  song: null,
  listenedSeconds: 0,
  timerId: null,
  elements: null
};

function updateProgress() {
  const { song, listenedSeconds, elements } = playerState;
  elements.elapsed.textContent = formatDuration(listenedSeconds);
  elements.fill.style.width = `${(listenedSeconds / song.durationSeconds) * 100}%`;
}

function setPlayButtonIcon(isPlaying) {
  const { playButton } = playerState.elements;
  playButton.replaceChildren(createIcon(isPlaying ? 'pause' : 'play'));
  playButton.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproducir');
}

function showPlayerStatus(message) {
  const { status } = playerState.elements;
  status.textContent = message;
  setTimeout(() => {
    status.textContent = '';
  }, statusResetDelayMs);
}

async function registerPlayEvent({ keepalive = false } = {}) {
  const { song, listenedSeconds } = playerState;
  const user = getCurrentUser();

  if (!song || !user || listenedSeconds === 0) {
    return;
  }

  playerState.listenedSeconds = 0;

  try {
    await apiClient.post(`/users/${user.id}/play-events`, { songId: song.id, listenedSeconds }, { keepalive });
    showPlayerStatus('Guardado en tu historial');
    window.dispatchEvent(new CustomEvent(playEventRegisteredEvent));
  } catch (error) {
    showToast(`No se pudo guardar la reproducción: ${error.message}`, 'error');
  }
}

function pause() {
  clearInterval(playerState.timerId);
  playerState.timerId = null;
  setPlayButtonIcon(false);
}

function finishSong() {
  pause();
  registerPlayEvent();
}

function tick() {
  playerState.listenedSeconds += 1;
  updateProgress();

  if (playerState.listenedSeconds >= playerState.song.durationSeconds) {
    finishSong();
  }
}

function resume() {
  if (!playerState.song || playerState.timerId) {
    return;
  }

  playerState.timerId = setInterval(tick, tickIntervalMs);
  setPlayButtonIcon(true);
}

function togglePlayback() {
  if (playerState.timerId) {
    pause();
  } else {
    resume();
  }
}

export async function playSongById(songId) {
  try {
    const { data: song } = await apiClient.get(`/songs/${songId}`);
    playSong(song);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

export function playSong(song) {
  if (playerState.song) {
    pause();
    registerPlayEvent();
  }

  const { elements } = playerState;
  playerState.song = song;
  playerState.listenedSeconds = 0;
  elements.title.textContent = song.title;
  elements.artist.textContent = song.artistName;
  elements.duration.textContent = formatDuration(song.durationSeconds);
  elements.playButton.disabled = false;
  updateProgress();
  resume();
}

export function createPlayer() {
  const playButton = createElement('button', { className: 'icon-button icon-button-brand', attributes: { type: 'button', 'aria-label': 'Reproducir' } }, [createIcon('play')]);
  playButton.disabled = true;
  playButton.addEventListener('click', togglePlayback);

  const elements = {
    playButton,
    title: createElement('div', { className: 'card-title', text: 'Nada en reproducción' }),
    artist: createElement('div', { className: 'card-subtitle', text: 'Elige una canción para empezar' }),
    elapsed: createElement('span', { text: '0:00' }),
    duration: createElement('span', { text: '0:00' }),
    fill: createElement('div', { className: 'progress-fill' }),
    status: createElement('div', { className: 'player-status', attributes: { 'aria-live': 'polite' } })
  };
  playerState.elements = elements;

  window.addEventListener('pagehide', () => registerPlayEvent({ keepalive: true }));

  return createElement('footer', { className: 'player' }, [
    createElement('div', { className: 'player-track' }, [
      createElement('div', { className: 'player-cover' }),
      createElement('div', { className: 'track-meta' }, [elements.title, elements.artist])
    ]),
    createElement('div', { className: 'player-controls' }, [
      playButton,
      createElement('div', { className: 'player-progress' }, [
        elements.elapsed,
        createElement('div', { className: 'progress-bar' }, [elements.fill]),
        elements.duration
      ])
    ]),
    elements.status
  ]);
}
