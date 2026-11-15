import { buildQuery } from './apiClient.js';
import { createElement, formatDuration, getInitial } from './dom.js';
import { createIcon } from './icons.js';
import { playSong } from './player.js';

const maxRating = 5;

export function createRatingStars(rating) {
  const stars = Array.from({ length: maxRating }, (_, index) => {
    const className = index < rating ? 'rating-star is-active' : 'rating-star';
    return createElement('span', { className }, [createIcon('star')]);
  });

  return createElement('span', { className: 'rating-stars', attributes: { 'aria-label': `${rating} de ${maxRating} estrellas` } }, stars);
}

export function createSongRow(song, { subtitle = song.artistName, onPlay = () => playSong(song), actions = [] } = {}) {
  const playButton = createElement('button', {
    className: 'icon-button',
    attributes: { type: 'button', 'aria-label': `Reproducir ${song.title}` }
  }, [createIcon('play')]);

  playButton.addEventListener('click', onPlay);

  return createElement('li', { className: 'track-row' }, [
    playButton,
    createElement('div', { className: 'track-meta' }, [
      createElement('div', { className: 'card-title', text: song.title }),
      createElement('div', { className: 'card-subtitle', text: subtitle })
    ]),
    ...actions,
    createElement('span', { className: 'track-duration', text: formatDuration(song.durationSeconds) })
  ]);
}

export function createAlbumCard(album, subtitle = '') {
  const cover = album.coverUrl
    ? createElement('img', { className: 'card-cover', attributes: { src: album.coverUrl, alt: `Portada de ${album.title}` } })
    : createElement('div', { className: 'card-cover', text: getInitial(album.title) });

  return createElement('a', { className: 'card', attributes: { href: `/album.html${buildQuery({ albumId: album.id })}` } }, [
    cover,
    createElement('div', {}, [
      createElement('div', { className: 'card-title', text: album.title }),
      createElement('div', { className: 'card-subtitle', text: subtitle })
    ])
  ]);
}