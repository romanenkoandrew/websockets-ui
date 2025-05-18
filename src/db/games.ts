import { Result } from "../ws/types";
import { User } from "./users"
import crypto from 'node:crypto'

type Position = { x: number; y: number }

export type Ship = {
  position: Position
  direction: boolean
  type: 'huge' | 'large' | 'medium' | 'small'
  length: number
}

export type Player = {
    idPlayer: string
    ships?: Ship[]
    ready?: boolean
}

type Game = {
    idGame: string
    players: [Player, Player]
    currentPlayer: string
}

const games = new Map<string, Game>()
const playerIdDictionary = new Map<string, string>()

export const createGame = (users: User[]) => {
    const firstParticipantId = crypto.randomUUID()
    const secondParticipantId = crypto.randomUUID()
    const idGame = crypto.randomUUID()

    playerIdDictionary.set(firstParticipantId, users[0].index)
    playerIdDictionary.set(secondParticipantId, users[1].index)

    const currentPlayer = Math.random() < 0.5 ? firstParticipantId : secondParticipantId
    
    const newGame: Game = {
        idGame,
        players: [ 
            {idPlayer: firstParticipantId},
            {idPlayer: secondParticipantId}
        ],
        currentPlayer
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

export const savePlayerShips = (gameId: string, playerId: string, ships: Ship[]): Result => {
    const game = getGameById(gameId)
    if (!game) return { error: true, errorMessage: 'Game not found' }
  
    const player = game.players.find(p => p.idPlayer === playerId)
    if (!player) return { error: true, errorMessage: 'Player not found' }
    
    player.ships = ships
    player.ready = true
  
    return { error: false, errorMessage: '' }
}

export const isGameReady = (gameId: string): boolean => {
    const game = getGameById(gameId)
    if (!game) return false
    return game.players.every(p => p.ready)
}

export const makeTurn = () => {

}