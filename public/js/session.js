import { loginPagePath, sessionStorageKey } from './config.js';

export function saveCurrentUser(user) {
  sessionStorage.setItem(sessionStorageKey, JSON.stringify(user));
}

export function getCurrentUser() {
  const storedUser = sessionStorage.getItem(sessionStorageKey);
  return storedUser ? JSON.parse(storedUser) : null;
}

export function clearCurrentUser() {
  sessionStorage.removeItem(sessionStorageKey);
}

export function requireCurrentUser() {
  const user = getCurrentUser();

  if (!user) {
    window.location.replace(loginPagePath);
  }

  return user;
}
