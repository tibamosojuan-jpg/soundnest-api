import * as sessionService from '../services/sessionService.js';

export async function createSession(req, res) {
  const user = await sessionService.createSession(req.body);
  res.status(201).json({ message: 'Inicio de sesión exitoso', data: user });
}
