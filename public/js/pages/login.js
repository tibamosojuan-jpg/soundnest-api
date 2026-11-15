import { apiClient } from '../apiClient.js';
import { createBrand } from '../brand.js';
import { homePagePath, loginPagePath, redirectDelayMs } from '../config.js';
import { clearFieldErrors, hideAlert, setButtonLoading, showAlert, showFieldErrors } from '../feedback.js';
import { getFormValues, getRequiredFieldErrors } from '../formValidation.js';
import { getCurrentUser, saveCurrentUser } from '../session.js';

const loginForm = document.getElementById('login-form');
const loginAlert = document.getElementById('login-alert');
const submitButton = loginForm.querySelector('button[type="submit"]');

const requiredMessages = {
  email: 'Ingresa tu correo electrónico',
  password: 'Ingresa tu contraseña'
};

function showRegistrationConfirmation() {
  const searchParams = new URLSearchParams(window.location.search);

  if (searchParams.has('registered')) {
    showAlert(loginAlert, 'Tu cuenta se creó correctamente. Ya puedes iniciar sesión.', 'success');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  clearFieldErrors(loginForm);
  hideAlert(loginAlert);

  const requiredErrors = getRequiredFieldErrors(loginForm, requiredMessages);

  if (requiredErrors.length > 0) {
    showFieldErrors(loginForm, requiredErrors);
    return;
  }

  setButtonLoading(submitButton, true, 'Iniciando sesión...');

  try {
    const credentials = getFormValues(loginForm, ['email', 'password']);
    const { data: user } = await apiClient.post('/sessions', credentials);
    saveCurrentUser(user);
    showAlert(loginAlert, `Hola, ${user.name}. Entrando a SoundNest...`, 'success');
    setTimeout(() => window.location.replace(homePagePath), redirectDelayMs);
  } catch (error) {
    setButtonLoading(submitButton, false);
    showFieldErrors(loginForm, error.fieldErrors ?? []);
    showAlert(loginAlert, error.message, 'error');
  }
}

if (getCurrentUser()) {
  window.location.replace(homePagePath);
}

showRegistrationConfirmation();
loginForm.addEventListener('submit', handleLogin);

document.getElementById('brand-slot').replaceWith(createBrand(loginPagePath));
