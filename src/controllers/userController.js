import * as userService from '../services/userService.js';

export async function createUser(req, res) {
  const user = await userService.registerUser(req.body);
  res.status(201).json({ message: 'Usuario registrado correctamente', data: user });
}

export async function getUsers(req, res) {
  const usersPage = await userService.listUsers(req.query);
  res.status(200).json({ message: 'Usuarios consultados correctamente', data: usersPage });
}

export async function getUser(req, res) {
  const user = await userService.getUserById(req.params.userId);
  res.status(200).json({ message: 'Usuario consultado correctamente', data: user });
}

export async function updateUser(req, res) {
  const user = await userService.updateUser(req.params.userId, req.body);
  res.status(200).json({ message: 'Usuario actualizado correctamente', data: user });
}
