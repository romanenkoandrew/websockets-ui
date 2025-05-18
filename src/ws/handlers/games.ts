import { createGame, getGameById, isGameReady, savePlayerShips, Ship } from "../../db/games"
import { getRoomUsers, isRoomReadyToStart, removeRoom, Room } from "../../db/rooms"
import { broadcastToGamePlayers, sendToPlayers } from "../broadcast"
import { Result } from "../types"
import { mapToResponse } from "../utils"

type AddShipsData = {
    gameId: string
    indexPlayer: string
    ships: Ship[]
  }

export const createGameHandler = (room: Room) => {
    if (!isRoomReadyToStart(room.roomId)) return
  
    const roomUsers = getRoomUsers(room.roomId)
    if (!roomUsers) return
  
    const game = createGame(roomUsers)
        
    sendToPlayers(game.idGame, game.players, 'create_game')
    removeRoom(room.roomId)
}


const startGame = (gameId: string) => {
    const game = getGameById(gameId)
    if (game) {
        sendToPlayers(game.idGame, game.players, 'start_game', player => ({ ships: player.ships }))
        sendToPlayers(game.idGame, game.players, 'turn', undefined, { currentPlayer: game.currentPlayer })
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
