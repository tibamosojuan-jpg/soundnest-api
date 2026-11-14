export function getRequiredFieldErrors(form, requiredMessages) {
  return Object.entries(requiredMessages)
    .filter(([field]) => form.elements.namedItem(field).value.trim() === '')
    .map(([field, message]) => ({ field, message }));
}

export function getFormValues(form, fields) {
  return Object.fromEntries(fields.map((field) => [field, form.elements.namedItem(field).value]));
}
