export default function notFoundHandler(req, res) {
  res.status(404).json({ message: `La ruta ${req.method} ${req.originalUrl} no existe` });
}
