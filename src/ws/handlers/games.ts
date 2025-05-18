import { createGame } from "../../db/games"
import { getRoomUsers, isRoomReadyToStart, removeRoom, Room } from "../../db/rooms"
import { broadcastToGamePlayers } from "../broadcast"
import { mapToResponse } from "../utils"

export const createGameHandler = (room: Room) => {
    if (!isRoomReadyToStart(room.roomId)) return
  
    const roomUsers = getRoomUsers(room.roomId)
    if (!roomUsers) return
  
    const game = createGame(roomUsers)
        
    const { idGame, players: [firstPlayer, secondPlayer] } = game
    const firstPlayerMessage = mapToResponse('create_game', JSON.stringify({ idGame, idPlayer: firstPlayer.idPlayer }))
    const secondPlayerMessage = mapToResponse('create_game', JSON.stringify({ idGame, idPlayer: secondPlayer.idPlayer }))

    broadcastToGamePlayers(game.idGame, {
        [firstPlayer.idPlayer]: firstPlayerMessage,
        [secondPlayer.idPlayer]: secondPlayerMessage
    })
    removeRoom(room.roomId)
}