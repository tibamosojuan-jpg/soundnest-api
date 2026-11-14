export function createElement(tagName, { className, text, attributes = {} } = {}, children = []) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  element.append(...children);
  return element;
}

export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function getInitial(text) {
  return text.trim().charAt(0).toUpperCase();
}
