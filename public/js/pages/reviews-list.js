import { apiClient, buildQuery } from '../apiClient.js';
import { createElement } from '../dom.js';
import { renderAsync } from '../feedback.js';
import { renderAppShell } from '../layout.js';

const reviewsLimit = 50;

function formatStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

async function loadReviews() {
  const { data } = await apiClient.get(`/reviews${buildQuery({ status: 'visible', limit: reviewsLimit })}`);
  return data.items;
}

function renderReviewCards(reviews) {
  const cards = reviews.map((review) => createElement('div', { className: 'card' }, [
    createElement('a', {
      className: 'card-title',
      text: review.songTitle,
      attributes: { href: `/reviews.html${buildQuery({ songId: review.songId })}` }
    }),
    createElement('div', { className: 'card-subtitle', text: `${review.userName} · ${formatStars(review.rating)}` }),
    createElement('p', { text: review.comment ?? 'Sin comentario' }),
    createElement('div', { className: 'card-subtitle', text: review.tags.map((tag) => `#${tag}`).join(' ') })
  ]));

  return createElement('div', { className: 'card-grid' }, cards);
}

const shell = renderAppShell('reviews');

if (shell) {
  const listContainer = createElement('div');

  shell.pageContent.append(
    createElement('div', { className: 'page-header' }, [
      createElement('div', {}, [
        createElement('h1', { text: 'Reseñas' }),
        createElement('p', { className: 'text-secondary', text: 'Lo que dice la comunidad sobre la música de SoundNest.' })
      ])
    ]),
    listContainer
  );

  renderAsync(listContainer, {
    load: loadReviews,
    render: renderReviewCards,
    emptyMessage: 'Aún no hay reseñas publicadas',
    loadingMessage: 'Cargando reseñas...'
  });
}