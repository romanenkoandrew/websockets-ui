import { getWinners } from "../../db/winners"
import { mapToResponse } from "../utils"

export const getWinnersHandlers = () => {
    return mapToResponse('update_winners', JSON.stringify(getWinners()))
}