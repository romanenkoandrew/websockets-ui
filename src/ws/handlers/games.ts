import { createGame, getGameById, isGameReady, processAttack, savePlayerShips } from "../../db/games"
import { getRoomUsers, isRoomReadyToStart, removeRoom, Room } from "../../db/rooms"
import { broadcastToGamePlayers, sendToPlayers } from "../broadcast"
import { AddShipsData, AttackData, MessageResponse, Result } from "../types"
import { mapToResponse, sucess } from "../utils"

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
    msgData: string
  ): Result => {
    let data: AttackData
    try {
      data = JSON.parse(msgData)
    } catch {
      return { error: true, errorMessage: 'Invalid JSON' }
    }

    const { gameId, x, y, indexPlayer } = data
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

    sendCurrentPlayer(gameId)
  
    return sucess
}
  
