import { createRatingStars } from '../components.js';
import { apiClient } from '../apiClient.js';
import { createElement, formatDuration, getInitial } from '../dom.js';
import { renderAsync, showError, showLoading, showToast } from '../feedback.js';
import { createIcon } from '../icons.js';
import { renderAppShell } from '../layout.js';

const songId = new URLSearchParams(window.location.search).get('songId');
const maxCommentLength = 500;
const maxTags = 10;
const starsCount = 5;

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
    createElement('div', { className: 'card-subtitle' }, [
      createRatingStars(review.rating),
      ` · escuchada ${review.listenCount} veces`
    ]),
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

function createStarPicker() {
  let rating = 0;

  const buttons = Array.from({ length: starsCount }, (_, index) => createElement('button', {
    className: 'star-button',
    attributes: { type: 'button', 'aria-label': `${index + 1} estrellas` }
  }, [createIcon('star')]));

  function setRating(value) {
    rating = value;
    buttons.forEach((button, index) => button.classList.toggle('is-active', index < rating));
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => setRating(index + 1)));

  return {
    element: createElement('div', { className: 'review-stars' }, buttons),
    getValue: () => rating,
    reset: () => setRating(0)
  };
}

function createCommentField() {
  const textArea = createElement('textarea', {
    className: 'review-textarea',
    attributes: { maxlength: String(maxCommentLength), placeholder: 'Escribe tu comentario (opcional)...' }
  });
  const counter = createElement('div', { className: 'review-counter' });

  function updateCounter() {
    counter.textContent = `${textArea.value.length}/${maxCommentLength}`;
  }

  textArea.addEventListener('input', updateCounter);
  updateCounter();

  return {
    elements: [textArea, counter],
    getValue: () => textArea.value.trim() || null,
    reset: () => {
      textArea.value = '';
      updateCounter();
    }
  };
}

function getTagError(value, tags) {
  if (value.includes(',')) {
    return 'Las etiquetas no pueden contener comas';
  }

  return tags.length >= maxTags ? `Máximo ${maxTags} etiquetas` : null;
}

function createTagEditor() {
  let tags = [];

  const tagInput = createElement('input', {
    attributes: { type: 'text', maxlength: '50', placeholder: 'Agregar etiqueta', 'aria-label': 'Agregar etiqueta' }
  });
  const tagChips = createElement('div', { className: 'tag-list' });
  const addTagButton = createElement('button', {
    className: 'button button-secondary',
    text: '+ Agregar',
    attributes: { type: 'button' }
  });

  function setTags(nextTags) {
    tags = nextTags;
    const chips = tags.map((tag) => {
      const chip = createElement('button', { className: 'tag-chip is-selected', text: `${tag} ×`, attributes: { type: 'button' } });
      chip.addEventListener('click', () => setTags(tags.filter((current) => current !== tag)));
      return chip;
    });
    tagChips.replaceChildren(...chips);
  }

  function addTag() {
    const value = tagInput.value.trim().toLowerCase();

    if (!value) {
      return;
    }

    const errorMessage = getTagError(value, tags);

    if (errorMessage) {
      showToast(errorMessage, 'error');
      return;
    }

    if (!tags.includes(value)) {
      setTags([...tags, value]);
    }

    tagInput.value = '';
  }

  addTagButton.addEventListener('click', addTag);

  return {
    element: createElement('div', {}, [
      createElement('div', { className: 'review-tags-label', text: 'Etiquetas (opcional)' }),
      tagChips,
      createElement('div', { className: 'tag-input-row' }, [tagInput, addTagButton])
    ]),
    getValue: () => tags,
    reset: () => setTags([])
  };
}

function createListenCounter() {
  const initialCount = 1;
  let listenCount = initialCount;

  const countValue = createElement('span');
  const minusButton = createElement('button', { text: '-', attributes: { type: 'button', 'aria-label': 'Restar escucha' } });
  const plusButton = createElement('button', { text: '+', attributes: { type: 'button', 'aria-label': 'Sumar escucha' } });

  function setCount(value) {
    listenCount = Math.max(0, value);
    countValue.textContent = String(listenCount);
  }

  minusButton.addEventListener('click', () => setCount(listenCount - 1));
  plusButton.addEventListener('click', () => setCount(listenCount + 1));
  setCount(initialCount);

  return {
    element: createElement('div', { className: 'listen-control' }, [
      createElement('span', { text: '¿Cuántas veces has escuchado esta canción?' }),
      createElement('div', { className: 'stepper' }, [minusButton, countValue, plusButton])
    ]),
    getValue: () => listenCount,
    reset: () => setCount(initialCount)
  };
}

async function submitReview(event, { user, fields, submitButton, reviewsBody }) {
  event.preventDefault();

  if (fields.rating.getValue() === 0) {
    showToast('Selecciona una calificación de 1 a 5', 'error');
    return;
  }

  submitButton.disabled = true;

  try {
    await apiClient.post(`/songs/${songId}/reviews`, {
      userId: user.id,
      rating: fields.rating.getValue(),
      comment: fields.comment.getValue(),
      listenCount: fields.listenCount.getValue(),
      tags: fields.tags.getValue()
    });

    showToast('Reseña publicada');
    Object.values(fields).forEach((field) => field.reset());
    loadReviews(reviewsBody);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitButton.disabled = false;
  }
}

function buildReviewForm(user, reviewsBody) {
  const songInfo = createElement('div', { className: 'review-song' });
  loadSongInfo(songInfo);

  const fields = {
    rating: createStarPicker(),
    comment: createCommentField(),
    tags: createTagEditor(),
    listenCount: createListenCounter()
  };

  const submitButton = createElement('button', {
    className: 'button-purple',
    text: 'Publicar reseña',
    attributes: { type: 'submit' }
  });

  const form = createElement('form', { className: 'review-card' }, [
    songInfo,
    fields.rating.element,
    ...fields.comment.elements,
    fields.tags.element,
    createElement('div', { className: 'review-footer' }, [fields.listenCount.element, submitButton])
  ]);

  form.addEventListener('submit', (event) => submitReview(event, { user, fields, submitButton, reviewsBody }));

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
      buildReviewForm(user, reviewsBody),
      createElement('section', { className: 'section' }, [
        createElement('h2', { className: 'section-title', text: 'Reseñas de la canción' }),
        reviewsBody
      ])
    );

    loadReviews(reviewsBody);
  }
}