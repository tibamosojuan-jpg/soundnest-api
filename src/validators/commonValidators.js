import { body, param, query } from 'express-validator';

export function idParam(name) {
  return param(name).isInt({ min: 1 }).withMessage('El identificador debe ser un número entero positivo');
}

export function idBody(name) {
  return body(name).isInt({ min: 1 }).withMessage('Debe ser un identificador entero positivo').toInt();
}

export function optionalUrl(name) {
  return body(name)
    .optional({ values: 'null' })
    .isURL().withMessage('Debe ser una URL válida')
    .isLength({ max: 255 }).withMessage('Admite máximo 255 caracteres');
}

export function requiredText(name, maxLength) {
  return body(name)
    .isString().withMessage('Debe ser un texto').bail()
    .trim()
    .notEmpty().withMessage('Es obligatorio')
    .isLength({ max: maxLength }).withMessage(`Admite máximo ${maxLength} caracteres`);
}

export function catalogStatus() {
  return body('status').isIn(['active', 'inactive']).withMessage('El estado debe ser active o inactive');
}

export function requireAnyField(fields) {
  return body()
    .custom((requestBody) => fields.some((field) => requestBody[field] !== undefined))
    .withMessage('Debe enviar al menos un campo para actualizar');
}

export const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100')
];
