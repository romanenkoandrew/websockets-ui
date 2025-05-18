import { createGame, getGameById, isGameReady, savePlayerShips, Ship } from "../../db/games"
import { getRoomUsers, isRoomReadyToStart, removeRoom, Room } from "../../db/rooms"
import { broadcastToGamePlayers } from "../broadcast"
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
        
    const { idGame, players: [firstPlayer, secondPlayer] } = game
    const firstPlayerMessage = mapToResponse('create_game', JSON.stringify({ idGame, idPlayer: firstPlayer.idPlayer }))
    const secondPlayerMessage = mapToResponse('create_game', JSON.stringify({ idGame, idPlayer: secondPlayer.idPlayer }))

    broadcastToGamePlayers(idGame, {
        [firstPlayer.idPlayer]: firstPlayerMessage,
        [secondPlayer.idPlayer]: secondPlayerMessage
    })
    removeRoom(room.roomId)
}


const startGame = (gameId: string) => {
    const game = getGameById(gameId)
    if (game) {
        const { idGame, players: [firstPlayer, secondPlayer] } = game
        const firstPlayerMessage = mapToResponse('start_game', JSON.stringify({ idGame, idPlayer: firstPlayer.idPlayer, ships: firstPlayer.ships }))
        const secondPlayerMessage = mapToResponse('start_game', JSON.stringify({ idGame, idPlayer: secondPlayer.idPlayer, ships: secondPlayer.ships }))
        
        broadcastToGamePlayers(idGame, {
            [firstPlayer.idPlayer]: firstPlayerMessage,
            [secondPlayer.idPlayer]: secondPlayerMessage
        })
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
