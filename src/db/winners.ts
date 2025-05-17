export type Winner = { name: string,  wins: number }
export type Winners = Winner[]
 

const winners = new Map<string, number>()

export const addWinner = (name: string) => {
    const winnerExists = winners.get(name)
    if (winnerExists) {
        winners.set(name, winnerExists + 1)
    } else {
        winners.set(name, 1)
    }
}

export const getWinners = (): Winners => {
    return [...winners.entries()].map(el => ({ name: el[0], wins: el[1]}))
}