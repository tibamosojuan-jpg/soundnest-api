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

async function loadSongHeader(header) {
  showLoading(header, 'Cargando canción...');

  try {
    const { data: song } = await apiClient.get(`/songs/${songId}`);
    header.replaceChildren(
      createElement('div', { className: 'card-cover', text: getInitial(song.title) }),
      createElement('div', {}, [
        createElement('h2', { text: song.title }),
        createElement('p', { className: 'text-secondary', text: song.artistName }),
        createElement('p', { className: 'card-subtitle', text: `${song.albumTitle} · ${formatDuration(song.durationSeconds)}` })
      ])
    );
  } catch (error) {
    showError(header, error.message, () => loadSongHeader(header));
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

function buildReviewForm(user, reviewsBody) {
  let rating = 0;
  let listenCount = 1;
  let tags = [];

  // Estrellas
  const starButtons = [1, 2, 3, 4, 5].map((value) => {
    const button = createElement('button', {
      className: 'star-button',
      text: '☆',
      attributes: { type: 'button', 'aria-label': `${value} estrellas` }
    });
    button.addEventListener('click', () => {
      rating = value;
      paintStars();
    });
    return button;
  });

  function paintStars() {
    starButtons.forEach((button, index) => {
      button.textContent = index < rating ? '★' : '☆';
    });
  }

  // Comentario
  const commentArea = createElement('textarea', {
    attributes: { maxlength: String(maxCommentLength), rows: '6', placeholder: 'Escribe tu comentario (opcional)...' }
  });
  const commentCounter = createElement('span', { className: 'text-secondary', text: `0/${maxCommentLength}` });
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
      const chip = createElement('button', { className: 'tag-chip', text: `${tag} ×`, attributes: { type: 'button' } });
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
  const minusButton = createElement('button', { className: 'icon-button', text: '-', attributes: { type: 'button', 'aria-label': 'Restar escucha' } });
  const plusButton = createElement('button', { className: 'icon-button', text: '+', attributes: { type: 'button', 'aria-label': 'Sumar escucha' } });

  minusButton.addEventListener('click', () => {
    listenCount = Math.max(0, listenCount - 1);
    countValue.textContent = String(listenCount);
  });
  plusButton.addEventListener('click', () => {
    listenCount += 1;
    countValue.textContent = String(listenCount);
  });

  const submitButton = createElement('button', {
    className: 'button button-primary',
    text: 'Publicar reseña',
    attributes: { type: 'submit' }
  });

  const form = createElement('form', { className: 'review-form' }, [
    createElement('div', { className: 'star-picker' }, starButtons),
    commentArea,
    createElement('div', {}, [commentCounter]),
    createElement('div', {}, [
      createElement('strong', { text: 'Etiquetas (opcional)' }),
      tagChips,
      createElement('div', { className: 'tag-input-row' }, [tagInput, addTagButton])
    ]),
    createElement('div', {}, [
      createElement('span', { text: '¿Cuántas veces has escuchado esta canción? ' }),
      minusButton,
      countValue,
      plusButton
    ]),
    submitButton
  ]);

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
    const songHeader = createElement('div', { className: 'page-header' });
    const reviewsBody = createElement('div');

    pageContent.append(
      createElement('div', { className: 'page-header' }, [
        createElement('div', {}, [
          createElement('h1', { text: 'Reseñas' }),
          createElement('p', { className: 'text-secondary', text: 'Comparte tu opinión sobre tu música' })
        ])
      ]),
      songHeader,
      buildReviewForm(user, reviewsBody),
      createElement('section', { className: 'section' }, [
        createElement('h2', { className: 'section-title', text: 'Reseñas de la canción' }),
        reviewsBody
      ])
    );

    loadSongHeader(songHeader);
    loadReviews(reviewsBody);
  }
}