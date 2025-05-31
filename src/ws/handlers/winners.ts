import { addWinner, getWinners } from "../../db/winners"
import { broadcastToAllUsers } from "../broadcast"
import { mapToResponse } from "../utils"

export const getWinnersHandler = () => {
    return mapToResponse('update_winners', JSON.stringify(getWinners()))
}

export const addWinnerHandler = (userId: string) => {
    addWinner(userId)
    const message = getWinnersHandler()
    broadcastToAllUsers(message)
}