import { WebSocket } from 'ws'
import { getRooms, createRoom, addUserToRoom, getRoomById, Room } from "../../db/rooms"
import { mapToResponse } from "../utils"
import { getUserBySocket } from '../../db/users'
import { Result } from '../types'
import { broadcastToAllUsers } from '../broadcast'

const sucess: Result = { error: false, errorMessage: '' }

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
    const room = getRoomById(roomId)

    if (!room) {
        return { error: true, errorMessage: 'The Room does not exist' }
    }

    const currentUser = getUserBySocket(socket)

    if (!currentUser) {
        return { error: true, errorMessage: 'User does not exist' }
    }

    if (room.roomUsers.find(user => user.index === currentUser.index)) {
        return { error: true, errorMessage: 'The user is already in the room' }
    }

    addUserToRoom(room.roomId, currentUser)
    broadcastToAllUsers(getRoomsHandler(), socket)
    return sucess
}