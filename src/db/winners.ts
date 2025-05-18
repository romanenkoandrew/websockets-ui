import { getUserById } from "./users"

export type Winner = { name: string,  wins: number }
export type Winners = Winner[]
 

const winners = new Map<string, number>()

export const addWinner = (userId: string) => {
    const user = getUserById(userId)
    
    if (!user) return

    const winnerExists = winners.get(user.name)

    if (winnerExists) {
        winners.set(user.name, winnerExists + 1)
    } else {
        winners.set(user.name, 1)
    }
}

export const getWinners = (): Winners => {
    return [...winners.entries()].map(el => ({ name: el[0], wins: el[1]}))
}