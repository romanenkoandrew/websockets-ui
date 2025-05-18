import { Message, MessageResponse, Result } from "./types"

export const mapToResponse = (type: Message, data: string): MessageResponse => {
    return { type, data, id: 0 }
}

export const sucess: Result = { error: false, errorMessage: '' }