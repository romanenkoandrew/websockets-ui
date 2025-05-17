import { WebSocket } from 'ws';
import crypto from 'node:crypto';

type User = {
  name: string;
  password: string;
};

type RegisteredUser = User & {
  index: string;
};

type UserResponse = {
  name: string;
  index: string;
  error: boolean;
  errorMessage: string;
};

const users = new Map<string, RegisteredUser>();
const userBySocket = new Map<WebSocket, RegisteredUser>();
const onlineUsers = new Set<string>();

export const loginByCredentials = (
  socket: WebSocket,
  name: string,
  password: string
): UserResponse => {
  if (onlineUsers.has(name)) {
    return createErrorResponse('User already in use');
  }

  const existingUser = users.get(name);

  if (existingUser) {
    if (existingUser.password !== password) {
      return createErrorResponse('Invalid password');
    }

    bindUserToSocket(socket, existingUser);
    return mapUserToResponse(existingUser);
  }

  const newUser = registerUser(name, password);
  bindUserToSocket(socket, newUser);
  return mapUserToResponse(newUser);
};

export const logout = (socket: WebSocket): void => {
  const user = userBySocket.get(socket);

  if (user) {
    onlineUsers.delete(user.name);
    userBySocket.delete(socket);
  }
};

const bindUserToSocket = (socket: WebSocket, user: RegisteredUser): void => {
  userBySocket.set(socket, user);
  onlineUsers.add(user.name);
};

const registerUser = (name: string, password: string): RegisteredUser => {
  const user: RegisteredUser = {
    name,
    password,
    index: crypto.randomUUID()
  };

  users.set(name, user);
  return user;
};

const mapUserToResponse = (user: RegisteredUser): UserResponse => ({
  name: user.name,
  index: user.index,
  error: false,
  errorMessage: ''
});

const createErrorResponse = (errorMessage: string): UserResponse => ({
  name: '',
  index: '',
  error: true,
  errorMessage
});
