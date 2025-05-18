import { AttackData, AttackResult, Game, Position, Result, Ship } from "../ws/types";
import { User } from "./users"
import crypto from 'node:crypto'

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

export const processAttack = (data: AttackData): AttackResult | null => {
    const { gameId, x, y, indexPlayer } = data
    const game = getGameById(gameId)
    if (!game) return null
  
    if (game.currentPlayer !== indexPlayer) {
      console.warn('Not your turn')
      return null
    }
  
    const attacker = game.players.find(p => p.idPlayer === indexPlayer)
    const opponent = game.players.find(p => p.idPlayer !== indexPlayer)
  
    if (!attacker || !opponent) return null
  
    const targetShips = opponent.ships
    if (!targetShips) return null
  
    const status = handleAttack(targetShips, { x, y })
  
    if (status === 'miss') {
      game.currentPlayer = opponent.idPlayer
    }
  
    return {
        position: { x, y },
        currentPlayer: attacker.idPlayer,
        status,
        players: game.players
    }
}

export const handleAttack = (ships: Ship[], position: Position): 'miss' | 'shot' | 'killed' => {
  for (const ship of ships) {
    const occupiedPositions = getOccupiedPositions(ship)

    const hitIndex = occupiedPositions.findIndex(
      (pos) => pos.x === position.x && pos.y === position.y
    )

    if (hitIndex !== -1) {
      ship.hits = ship.hits || []
      const alreadyHit = ship.hits.some(pos => pos.x === position.x && pos.y === position.y)

      if (!alreadyHit) {
        ship.hits.push(position)
      }

      const isKilled = occupiedPositions.every(pos =>
        ship.hits.some(hit => hit.x === pos.x && hit.y === pos.y)
      )

      return isKilled ? 'killed' : 'shot'
    }
  }

  return 'miss'
}

const getOccupiedPositions = (ship: Ship): Position[] => {
    const positions: Position[] = []
  
    for (let i = 0; i < ship.length; i++) {
      positions.push({
        x: ship.position.x + (ship.direction ? 0 : i),
        y: ship.position.y + (ship.direction ? i : 0)
      })
    }
  
    return positions
}
  