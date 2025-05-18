import { User } from "./users"
import crypto from 'node:crypto'

export type Room = {
    roomId: string
    roomUsers: User[]
}

const rooms = new Map<string, Room>()

export const createRoom = (userId: string) => {
    const alreadyInRoom = getRooms().find(room => room.roomUsers.some(it => it.index === userId))

    if (alreadyInRoom) {
        return null
    }

    const roomId = crypto.randomUUID()
    const newRoom = { roomId, roomUsers: [] }
    rooms.set(roomId, newRoom)
    return newRoom
}

export const getRooms = () => {
    return [...rooms.values()]
}

export const getRoomById = (roomId: string) => {
    return rooms.get(roomId)
}

export const addUserToRoom = (roomId: string, user: User): boolean => {
    const room = getRoomById(roomId)

    if (!room) return false

    // const alreadyInRoom = room.roomUsers.some((u) => u.index === user.index)
    const alreadyInRoom = getRooms().find(room => room.roomUsers.some(it => it.index === user.index))
    if (alreadyInRoom) return false

    room.roomUsers.push(user)
    return true
}