import { Message, MessageResponse } from "./types"

export const mapToResponse = (type: Message, data: string): MessageResponse => {
    return { type, data, id: 0 }
}