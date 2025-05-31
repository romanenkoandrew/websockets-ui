import { createGame, getGameById, isGameReady, playerIdResolver, processAttack, removeGameById, savePlayerShips } from "../../db/games"
import { getRoomUsers, isRoomReadyToStart, removeRoom, Room } from "../../db/rooms"
import { broadcastToGamePlayers, sendToPlayers } from "../broadcast"
import { AddShipsData, AttackData, Position, Result } from "../types"
import { getRandomCoords, mapToResponse, sucess } from "../utils"
import { addWinnerHandler } from "./winners"

const mapSize = {x: 10, y: 10}

export const createGameHandler = (room: Room) => {
    if (!isRoomReadyToStart(room.roomId)) return
  
    const roomUsers = getRoomUsers(room.roomId)
    if (!roomUsers) return
  
    const game = createGame(roomUsers)
        
    sendToPlayers(game.idGame, game.players, 'create_game')
    removeRoom(room.roomId)
}

const sendCurrentPlayer = (gameId: string) => {
    const game = getGameById(gameId)
    
    if (game) {
        const message = mapToResponse('turn', JSON.stringify({ currentPlayer: game.currentPlayer }))

        broadcastToGamePlayers(gameId, {
            [game.players[0].idPlayer]: message,
            [game.players[1].idPlayer]: message,
          })
    }
}

const startGame = (gameId: string) => {
    const game = getGameById(gameId)
    if (game) {
        sendToPlayers(game.idGame, game.players, 'start_game', player => ({ ships: player.ships }))
        sendCurrentPlayer(gameId)
    }
}

const endGame = (gameId: string, winner: string) => {
    const game = getGameById(gameId)
    
    if (game) {
        const message = mapToResponse('finish', JSON.stringify({ winPlayer: winner }))

        broadcastToGamePlayers(gameId, {
            [game.players[0].idPlayer]: message,
            [game.players[1].idPlayer]: message,
          })
        
        removeGameById(gameId)
    }
}

export const addShipsHandler = (msgData: string): Result => {
    let data: AddShipsData
    try {
      data = JSON.parse(msgData)
    } catch {
      return { error: true, errorMessage: 'Invalid JSON' }
    }
  
    const result = savePlayerShips(data.gameId, data.indexPlayer, data.ships)
    if (result.error) return result
  
    if (isGameReady(data.gameId)) {
      startGame(data.gameId)
    }
  
    return { error: false, errorMessage: '' }
}

export const attackHandler = (
    msgData: string,
    withoutCoords: boolean = false
  ): Result => {
    let data: AttackData
    try {
      data = JSON.parse(msgData)
    } catch {
      return { error: true, errorMessage: 'Invalid JSON' }
    }

    let x: Position['x']
    let y: Position['y']

    const { gameId, indexPlayer } = data

    if (withoutCoords) {
        const randomCoords = getRandomCoords(mapSize.x, mapSize.y)
        x = randomCoords.x
        y = randomCoords.y
    } else {
        x = data.x
        y = data.y
    }

    const result = processAttack({gameId, indexPlayer, x, y})
  
    if (!result) {
      return { error: true, errorMessage: 'Invalid attack' }
    }
  
    const attackMessage = mapToResponse('attack', JSON.stringify({
      position: result.position,
      currentPlayer: result.currentPlayer,
      status: result.status
    }))
  
    broadcastToGamePlayers(gameId, {
      [result.players[0].idPlayer]: attackMessage,
      [result.players[1].idPlayer]: attackMessage,
    })

    if (result.winPlayer) {
        const winnerUserId = playerIdResolver(result.winPlayer)
        
        endGame(gameId, result.winPlayer)

        if (winnerUserId) {
            addWinnerHandler(winnerUserId)
        }

        return sucess
    }

    sendCurrentPlayer(gameId)
  
    return sucess
}
