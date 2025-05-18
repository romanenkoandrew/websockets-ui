type RoomMessages = 'update_room' | 'create_room' | 'add_user_to_room'
export type Message = 'reg' | 'update_winners' | 'unknown' | 'error' | RoomMessages

export type IncomingMessage = { type: Message; data: string, id: number }

export type RegData = { name: string; password: string }
export type AddToRoomData = { indexRoom: string }

export type MessageResponse = {
  type: Message;
  data: string;
  id: number
}

export type Error = {
  error: boolean
  errorMessage: string
}
