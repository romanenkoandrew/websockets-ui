import { User } from "./users"
import crypto from 'node:crypto'

type Player = {
    idPlayer: string
}

type Game = {
    idGame: string
    players: [Player, Player]
}

const games = new Map<string, Game>()
const playerIdDictionary = new Map<string, string>()

export const createGame = (users: User[]) => {
    const firstParticipantId = crypto.randomUUID()
    const secondParticipantId = crypto.randomUUID()
    const idGame = crypto.randomUUID()

    playerIdDictionary.set(firstParticipantId, users[0].index)
    playerIdDictionary.set(secondParticipantId, users[1].index)
    
    const newGame: Game = {
        idGame,
        players: [ 
            {idPlayer: firstParticipantId},
            {idPlayer: secondParticipantId}
         ]
    }

    games.set(idGame, newGame)

    return newGame
}

export const getGameById = (gameId: string) => {
    return games.get(gameId)
}

export const playerIdResolver = (playerId: string) => {
    return playerIdDictionary.get(playerId)
} 