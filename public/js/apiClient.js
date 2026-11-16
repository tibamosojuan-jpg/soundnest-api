import { apiBaseUrl } from './config.js';

class ApiError extends Error {
  constructor(message, statusCode, fieldErrors = []) {
    super(message);
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

const networkErrorMessage = 'No fue posible conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';

async function parseBody(response) {
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('application/json') ? response.json() : null;
}

async function request(method, path, body, { keepalive = false } = {}) {
  const options = { method, headers: {}, keepalive };

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, options);
  } catch {
    throw new ApiError(networkErrorMessage, 0);
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(payload?.message ?? 'Ocurrió un error inesperado', response.status, payload?.errors ?? []);
  }

  return payload;
}

export function buildQuery(params) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
  return entries.length === 0 ? '' : `?${new URLSearchParams(entries)}`;
}

export const apiClient = {
  get: (path) => request('GET', path),
  post: (path, body, options) => request('POST', path, body, options),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path)
};
