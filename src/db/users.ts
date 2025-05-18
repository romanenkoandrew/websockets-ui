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
const userConnections = new Map<WebSocket, User>()
const userConnectionsById = new Map<string, WebSocket>()

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
  const user = userConnections.get(socket)

  if (user) {
    userConnectionsById.delete(user.index)
  }
  userConnections.delete(socket)
}

export const getUserBySocket = (socket: WebSocket) => {
  return userConnections.get(socket)
}

export const getSocketByUser = (userId?: User['index']) => {
  if (!userId) return
  return userConnectionsById.get(userId)
}

export const getUserById = (userId: string) => {
  const user = users.get(userId)
  
  if (!user) return

  return { name: user.name, index: user.index }
} 

export const getOnlineUsers = () => ({
  users: () => [...userConnections.values()],
  sockets: () => [...userConnections.keys()],
  all: () => [...userConnections.entries()],
})

const bindUserToSocket = (socket: WebSocket, user: RegisteredUser): void => {
  userConnections.set(socket, { name: user.name, index: user.index })
  userConnectionsById.set(user.index, socket)
}

const registerUser = (name: string, password: string): RegisteredUser => {
  const user: RegisteredUser = {
    name,
    password,
    index: crypto.randomUUID()
  }

  users.set(user.index, user)
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
