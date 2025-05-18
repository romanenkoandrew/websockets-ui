import { Message, MessageResponse, Position, Result } from "./types"

export const mapToResponse = (type: Message, data: string): MessageResponse => {
    return { type, data, id: 0 }
}

export const sucess: Result = { error: false, errorMessage: '' }


export const getRandomCoords = (xSize: number, ySize: number): Position => {
    return { x: Math.floor(Math.random() * xSize), y: Math.floor(Math.random() * ySize)}
}