import * as playEventService from '../services/playEventService.js';

export async function getUserPlayEvents(req, res) {
  const filters = { ...req.query, userId: req.params.userId };
  const playEventsPage = await playEventService.listUserPlayEvents(filters);
  res.status(200).json({ message: 'Historial de reproducción consultado correctamente', data: playEventsPage });
}

export async function createPlayEvent(req, res) {
  const playEvent = await playEventService.registerPlayEvent(req.params.userId, req.body);
  res.status(201).json({ message: 'Reproducción registrada correctamente', data: playEvent });
}

export async function getListeningSummary(req, res) {
  const summary = await playEventService.getListeningSummary(req.params.userId);
  res.status(200).json({ message: 'Resumen de escucha consultado correctamente', data: summary });
}
