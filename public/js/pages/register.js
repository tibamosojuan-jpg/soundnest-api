import { apiClient } from '../apiClient.js';
import { loginPagePath, redirectDelayMs } from '../config.js';
import { clearFieldErrors, hideAlert, setButtonLoading, showAlert, showFieldErrors } from '../feedback.js';
import { getFormValues, getRequiredFieldErrors } from '../formValidation.js';

const registerForm = document.getElementById('register-form');
const registerAlert = document.getElementById('register-alert');
const submitButton = registerForm.querySelector('button[type="submit"]');
const minimumPasswordLength = 8;

const requiredMessages = {
  name: 'Ingresa tu nombre',
  email: 'Ingresa tu correo electrónico',
  password: 'Ingresa una contraseña',
  passwordConfirmation: 'Confirma tu contraseña'
};

function getClientErrors({ password, passwordConfirmation }) {
  const errors = getRequiredFieldErrors(registerForm, requiredMessages);

  if (password && password.length < minimumPasswordLength) {
    errors.push({ field: 'password', message: `La contraseña debe tener mínimo ${minimumPasswordLength} caracteres` });
  }

  if (passwordConfirmation && password !== passwordConfirmation) {
    errors.push({ field: 'passwordConfirmation', message: 'Las contraseñas no coinciden' });
  }

  if (!registerForm.elements.namedItem('acceptTerms').checked) {
    errors.push({ field: 'acceptTerms', message: 'Debes aceptar los términos para continuar' });
  }

  return errors;
}

async function handleRegister(event) {
  event.preventDefault();
  clearFieldErrors(registerForm);
  hideAlert(registerAlert);

  const formValues = getFormValues(registerForm, ['name', 'email', 'password', 'passwordConfirmation']);
  const clientErrors = getClientErrors(formValues);

  if (clientErrors.length > 0) {
    showFieldErrors(registerForm, clientErrors);
    return;
  }

  setButtonLoading(submitButton, true, 'Creando cuenta...');

  try {
    const { name, email, password } = formValues;
    await apiClient.post('/users', { name, email, password });
    showAlert(registerAlert, 'Cuenta creada correctamente. Te llevamos al inicio de sesión...', 'success');
    setTimeout(() => window.location.replace(`${loginPagePath}?registered=1`), redirectDelayMs);
  } catch (error) {
    setButtonLoading(submitButton, false);
    showFieldErrors(registerForm, error.fieldErrors ?? []);
    showAlert(registerAlert, error.message, 'error');
  }
}

registerForm.addEventListener('submit', handleRegister);
