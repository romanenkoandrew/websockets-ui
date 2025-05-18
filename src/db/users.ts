import { WebSocket } from 'ws'
import crypto from 'node:crypto'
import { Result } from '../ws/types'

type UserCredentials = {
  name: string
  password: string
}

type RegisteredUser = UserCredentials & {
  index: string
}

export type User = Omit<RegisteredUser, 'password'>

type UserResponse = User & Result

const users = new Map<string, RegisteredUser>()
const onlineUserBySocket = new Map<WebSocket, User>()

export const loginByCredentials = (
  socket: WebSocket,
  name: string,
  password: string
): UserResponse => {
  if (getOnlineUsers().users().some(user => user.name === name))
    return createErrorResponse('User already in use')

  const user = users.get(name)

  if (user && user.password !== password)
    return createErrorResponse('Invalid password')

  const finalUser = user ?? registerUser(name, password)
  bindUserToSocket(socket, finalUser)

  return mapUserToResponse(finalUser)
}

export const logout = (socket: WebSocket): void => {
  const user = onlineUserBySocket.get(socket)

  if (user) {
    onlineUserBySocket.delete(socket)
  }
}

export const getUserBySocket = (socket: WebSocket) => {
  return onlineUserBySocket.get(socket)
}

export const getOnlineUsers = () => ({
  users: () => [...onlineUserBySocket.values()],
  sockets: () => [...onlineUserBySocket.keys()],
  all: () => [...onlineUserBySocket.entries()],
})

const bindUserToSocket = (socket: WebSocket, user: RegisteredUser): void => {
  onlineUserBySocket.set(socket, { name: user.name, index: user.index })
}

const registerUser = (name: string, password: string): RegisteredUser => {
  const user: RegisteredUser = {
    name,
    password,
    index: crypto.randomUUID()
  }

  users.set(name, user)
  return user
}

const mapUserToResponse = (user: RegisteredUser): UserResponse => ({
  name: user.name,
  index: user.index,
  error: false,
  errorMessage: ''
})

const createErrorResponse = (errorMessage: string): UserResponse => ({
  name: '',
  index: '',
  error: true,
  errorMessage
})
