import { apiClient } from '../apiClient.js';
import { createElement, formatDuration, getInitial } from '../dom.js';
import { renderAsync, showError, showLoading, showToast } from '../feedback.js';
import { renderAppShell } from '../layout.js';

const songId = new URLSearchParams(window.location.search).get('songId');
const maxCommentLength = 500;
const maxTags = 10;

function formatStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

async function loadSongInfo(container) {
  showLoading(container, 'Cargando canción...');

  try {
    const { data: song } = await apiClient.get(`/songs/${songId}`);
    container.replaceChildren(
      createElement('div', { className: 'review-song-cover', text: getInitial(song.title) }),
      createElement('div', {}, [
        createElement('div', { className: 'card-title', text: song.title }),
        createElement('div', { className: 'card-subtitle', text: song.artistName }),
        createElement('div', { className: 'card-subtitle', text: `${song.albumTitle} · ${formatDuration(song.durationSeconds)}` })
      ])
    );
  } catch (error) {
    showError(container, error.message, () => loadSongInfo(container));
  }
}

function renderReviewCards(reviews) {
  const cards = reviews.map((review) => createElement('div', { className: 'card' }, [
    createElement('div', { className: 'card-title', text: review.userName }),
    createElement('div', { className: 'card-subtitle', text: `${formatStars(review.rating)} · escuchada ${review.listenCount} veces` }),
    createElement('p', { text: review.comment ?? 'Sin comentario' }),
    createElement('div', { className: 'card-subtitle', text: review.tags.map((tag) => `#${tag}`).join(' ') })
  ]));

  return createElement('div', { className: 'card-grid' }, cards);
}

function loadReviews(reviewsBody) {
  renderAsync(reviewsBody, {
    load: async () => (await apiClient.get(`/songs/${songId}/reviews`)).data,
    render: renderReviewCards,
    emptyMessage: 'Aún no hay reseñas para esta canción',
    loadingMessage: 'Cargando reseñas...'
  });
}

function buildReviewCard(user, reviewsBody) {
  let rating = 0;
  let listenCount = 1;
  let tags = [];

  const songInfo = createElement('div', { className: 'review-song' });
  loadSongInfo(songInfo);

  // Estrellas
  const starButtons = [1, 2, 3, 4, 5].map((value) => {
    const button = createElement('button', {
      className: 'star-button',
      text: '★',
      attributes: { type: 'button', 'aria-label': `${value} estrellas` }
    });
    button.addEventListener('click', () => {
      rating = value;
      paintStars();
    });
    return button;
  });

  function paintStars() {
    starButtons.forEach((button, index) => button.classList.toggle('is-active', index < rating));
  }

  // Comentario
  const commentArea = createElement('textarea', {
    className: 'review-textarea',
    attributes: { maxlength: String(maxCommentLength), placeholder: 'Escribe tu comentario (opcional)...' }
  });
  const commentCounter = createElement('div', { className: 'review-counter', text: `0/${maxCommentLength}` });
  commentArea.addEventListener('input', () => {
    commentCounter.textContent = `${commentArea.value.length}/${maxCommentLength}`;
  });

  // Etiquetas
  const tagInput = createElement('input', {
    attributes: { type: 'text', maxlength: '50', placeholder: 'Agregar etiqueta', 'aria-label': 'Agregar etiqueta' }
  });
  const tagChips = createElement('div', { className: 'tag-list' });

  function paintTags() {
    const chips = tags.map((tag) => {
      const chip = createElement('button', {
        className: 'tag-chip is-selected',
        text: `${tag} ×`,
        attributes: { type: 'button' }
      });
      chip.addEventListener('click', () => {
        tags = tags.filter((current) => current !== tag);
        paintTags();
      });
      return chip;
    });
    tagChips.replaceChildren(...chips);
  }

  const addTagButton = createElement('button', {
    className: 'button button-secondary',
    text: '+ Agregar',
    attributes: { type: 'button' }
  });
  addTagButton.addEventListener('click', () => {
    const value = tagInput.value.trim().toLowerCase();

    if (!value) {
      return;
    }

    if (value.includes(',')) {
      showToast('Las etiquetas no pueden contener comas', 'error');
      return;
    }

    if (tags.length >= maxTags) {
      showToast(`Máximo ${maxTags} etiquetas`, 'error');
      return;
    }

    if (!tags.includes(value)) {
      tags = [...tags, value];
      paintTags();
    }

    tagInput.value = '';
  });

  // Veces escuchada
  const countValue = createElement('span', { text: String(listenCount) });
  const minusButton = createElement('button', { text: '-', attributes: { type: 'button', 'aria-label': 'Restar escucha' } });
  const plusButton = createElement('button', { text: '+', attributes: { type: 'button', 'aria-label': 'Sumar escucha' } });

  minusButton.addEventListener('click', () => {
    listenCount = Math.max(0, listenCount - 1);
    countValue.textContent = String(listenCount);
  });
  plusButton.addEventListener('click', () => {
    listenCount += 1;
    countValue.textContent = String(listenCount);
  });

  const submitButton = createElement('button', {
    className: 'button-purple',
    text: 'Publicar reseña',
    attributes: { type: 'submit' }
  });

  const form = createElement('form', { className: 'review-card' }, [
    songInfo,
    createElement('div', { className: 'review-stars' }, starButtons),
    commentArea,
    commentCounter,
    createElement('div', {}, [
      createElement('div', { className: 'review-tags-label', text: 'Etiquetas (opcional)' }),
      tagChips,
      createElement('div', { className: 'tag-input-row' }, [tagInput, addTagButton])
    ]),
    createElement('div', { className: 'review-footer' }, [
      createElement('div', { className: 'listen-control' }, [
        createElement('span', { text: '¿Cuántas veces has escuchado esta canción?' }),
        createElement('div', { className: 'stepper' }, [minusButton, countValue, plusButton])
      ]),
      submitButton
    ])
  ]);

  paintStars();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (rating === 0) {
      showToast('Selecciona una calificación de 1 a 5', 'error');
      return;
    }

    submitButton.disabled = true;

    try {
      await apiClient.post(`/songs/${songId}/reviews`, {
        userId: user.id,
        rating,
        comment: commentArea.value.trim() || null,
        listenCount,
        tags
      });

      showToast('Reseña publicada');

      rating = 0;
      paintStars();
      commentArea.value = '';
      commentCounter.textContent = `0/${maxCommentLength}`;
      tags = [];
      paintTags();
      listenCount = 1;
      countValue.textContent = '1';

      loadReviews(reviewsBody);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  return form;
}

const shell = renderAppShell('reviews');

if (shell) {
  const { user, pageContent } = shell;

  if (!songId) {
    pageContent.append(createElement('div', { className: 'state state-error', text: 'Falta el identificador de la canción.' }));
  } else {
    const reviewsBody = createElement('div');

    pageContent.append(
      createElement('div', { className: 'page-header review-title' }, [
        createElement('h1', { text: 'Reseñas' }),
        createElement('span', { className: 'text-secondary', text: 'Comparte tu opinión sobre tu música' })
      ]),
      buildReviewCard(user, reviewsBody),
      createElement('section', { className: 'section' }, [
        createElement('h2', { className: 'section-title', text: 'Reseñas de la canción' }),
        reviewsBody
      ])
    );

    loadReviews(reviewsBody);
  }
}