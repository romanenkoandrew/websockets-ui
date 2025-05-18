type RoomMessages = 'update_room' | 'create_room' | 'add_user_to_room'
type GameMessages = 'create_game' | 'start_game' | 'add_ships' | 'turn'
export type Message = 'reg' | 'update_winners' | 'unknown' | 'error' | RoomMessages | GameMessages

export type IncomingMessage = { type: Message; data: string, id: number }

export type RegData = { name: string; password: string }
export type AddToRoomData = { indexRoom: string }

export type MessageResponse = {
  type: Message;
  data: string;
  id: number
}

export type Result = {
  error: boolean
  errorMessage: string
}
