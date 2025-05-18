import { getWinners } from "../../db/winners"
import { mapToResponse } from "../utils"

export const getWinnersHandler = () => {
    return mapToResponse('update_winners', JSON.stringify(getWinners()))
}