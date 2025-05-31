import { WebSocket } from 'ws'
import { getRooms, createRoom, addUserToRoom, getRoomById, Room, userIsAlreadyInRoom, removeRoom } from "../../db/rooms"
import { mapToResponse, sucess } from "../utils"
import { getUserBySocket, User } from '../../db/users'
import { Result } from '../types'
import { broadcastToAllUsers } from '../broadcast'
import { createGameHandler } from './games'

export const getRoomsHandler = () => {
    return mapToResponse('update_room', JSON.stringify(getRooms()))
}

export const createRoomHandler = (socket: WebSocket): Result => {
    const user = getUserBySocket(socket)

    if (!user) {
        return { error: true, errorMessage: 'User does not exists' }
    }

    const room = createRoom(user.index)
    if (!room) return { error: true, errorMessage: 'The user is already in the room' }
    
    addUserToRoom(room.roomId, user)
    broadcastToAllUsers(getRoomsHandler(), socket)
    return sucess
}

export const addUserToRoomHandler = (socket: WebSocket, roomId: string): Result => {
    const validationResult = validateAddUserToRoom(socket, roomId)
    if (validationResult.error) return validationResult

    const { room, user } = validationResult

    addUserToRoom(room.roomId, user)
    createGameHandler(room)

    broadcastToAllUsers(getRoomsHandler(), socket)
    return sucess
}

export const removeRoomHandler = (socket: WebSocket) => {
  const user = getUserBySocket(socket)

  if (user) {
    const room = userIsAlreadyInRoom(user.index)
    console.log('room', room);
    
    if (room) {
      removeRoom(room.roomId)
      broadcastToAllUsers(getRoomsHandler(), socket)
    }
  }
}

type AddUserValidationResult =
  | { error: false; room: Room; user: User; errorMessage: string }
  | { error: true; errorMessage: string }

const validateAddUserToRoom = (
    socket: WebSocket,
    roomId: string
  ): AddUserValidationResult => {
    const room = getRoomById(roomId)
    if (!room) return { error: true, errorMessage: 'The Room does not exist' }
  
    const user = getUserBySocket(socket)
    if (!user) return { error: true, errorMessage: 'User does not exist' }
  
    if (room.roomUsers.some(u => u.index === user.index)) {
      return { error: true, errorMessage: 'The user is already in the room' }
    }
  
    return { ...sucess, room, user }
  }