import { createElement } from './dom.js';
import { toastDurationMs } from './config.js';

export function showLoading(container, message = 'Cargando...') {
  container.replaceChildren(
    createElement('div', { className: 'state', attributes: { role: 'status' } }, [
      createElement('div', { className: 'spinner' }),
      createElement('span', { text: message })
    ])
  );
}

export function showError(container, message, onRetry) {
  const children = [createElement('span', { text: message })];

  if (onRetry) {
    const retryButton = createElement('button', { className: 'button button-secondary', text: 'Reintentar', attributes: { type: 'button' } });
    retryButton.addEventListener('click', onRetry);
    children.push(retryButton);
  }

  container.replaceChildren(createElement('div', { className: 'state state-error', attributes: { role: 'alert' } }, children));
}

function showEmpty(container, message) {
  container.replaceChildren(createElement('div', { className: 'state', text: message }));
}

export async function renderAsync(container, { load, render, emptyMessage, loadingMessage }) {
  showLoading(container, loadingMessage);

  try {
    const items = await load();

    if (items.length === 0) {
      showEmpty(container, emptyMessage);
      return;
    }

    container.replaceChildren(render(items));
  } catch (error) {
    showError(container, error.message, () => renderAsync(container, { load, render, emptyMessage, loadingMessage }));
  }
}

function getToastContainer() {
  let toastContainer = document.querySelector('.toast-container');

  if (!toastContainer) {
    toastContainer = createElement('div', { className: 'toast-container', attributes: { 'aria-live': 'polite' } });
    document.body.append(toastContainer);
  }

  return toastContainer;
}

export function showToast(message, type = 'success') {
  const toast = createElement('div', { className: type === 'error' ? 'toast toast-error' : 'toast', text: message });
  getToastContainer().append(toast);
  setTimeout(() => toast.remove(), toastDurationMs);
}

export function setButtonLoading(button, isLoading, loadingText = 'Procesando...') {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.replaceChildren(createElement('span', { className: 'spinner spinner-small' }), loadingText);
  } else {
    button.textContent = button.dataset.originalText;
  }

  button.disabled = isLoading;
}

export function showAlert(alertElement, message, type) {
  alertElement.className = `alert alert-${type}`;
  alertElement.textContent = message;
  alertElement.hidden = false;
}

export function hideAlert(alertElement) {
  alertElement.hidden = true;
}

export function clearFieldErrors(form) {
  form.querySelectorAll('.field-error').forEach((errorElement) => {
    errorElement.textContent = '';
  });
  form.querySelectorAll('.is-invalid').forEach((input) => input.classList.remove('is-invalid'));
}

export function showFieldErrors(form, fieldErrors) {
  fieldErrors.forEach(({ field, message }) => {
    const input = form.elements.namedItem(field);
    const errorElement = form.querySelector(`[data-error-for="${field}"]`);

    if (input) {
      input.classList.add('is-invalid');
    }

    if (errorElement) {
      errorElement.textContent = message;
    }
  });
}

export function confirmAction(message, confirmLabel = 'Confirmar') {
  return new Promise((resolve) => {
    const cancelButton = createElement('button', { className: 'button button-secondary', text: 'Cancelar', attributes: { type: 'button' } });
    const confirmButton = createElement('button', { className: 'button button-danger', text: confirmLabel, attributes: { type: 'button' } });
    const backdrop = createElement('div', { className: 'modal-backdrop' }, [
      createElement('div', { className: 'modal', attributes: { role: 'dialog', 'aria-modal': 'true' } }, [
        createElement('p', { text: message }),
        createElement('div', { className: 'modal-actions' }, [cancelButton, confirmButton])
      ])
    ]);

    const close = (isConfirmed) => {
      backdrop.remove();
      resolve(isConfirmed);
    };

    cancelButton.addEventListener('click', () => close(false));
    confirmButton.addEventListener('click', () => close(true));
    document.body.append(backdrop);
    confirmButton.focus();
  });
}
