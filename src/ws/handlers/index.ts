import { IncomingMessage, RegData, MessageResponse, AddToRoomData } from '../types';
import { WebSocket } from 'ws';
import { loginByCredentials } from '../../db/users';
import { mapToResponse } from '../utils';
import { getWinnersHandler } from './winners';
import { getRoomsHandler, createRoomHandler, addUserToRoomHandler,} from './rooms';
import { addShipsHandler, attackHandler } from './games';

export const handleMessage = (ws: WebSocket, msg: IncomingMessage): MessageResponse[] => {
    const responses: MessageResponse[] = []
    try {
        switch (msg.type) {
            case 'reg': {
                const data: RegData = JSON.parse(msg.data)
                const { name, password } = data
                const loginResult = loginByCredentials(ws, name, password)

                responses.push(mapToResponse(msg.type, JSON.stringify(loginResult)))

                if (!loginResult.error) {
                    responses.push(getRoomsHandler())
                    responses.push(getWinnersHandler())
                }
                
                return responses
            }
            case 'create_room': {
                const result = createRoomHandler(ws)
                
                if (result.error) {
                    responses.push(mapToResponse('error', JSON.stringify(result)))
                } else {
                    responses.push(getRoomsHandler())
                }

                return responses
            }
            case 'add_user_to_room': {
                const data: AddToRoomData = JSON.parse(msg.data)
                const { indexRoom } = data
                const result = addUserToRoomHandler(ws, indexRoom)
                
                if (result.error) {
                    responses.push(mapToResponse('error', JSON.stringify(result)))
                } else {
                    responses.push(getRoomsHandler())
                }

                return responses
            }
            case 'add_ships': {
                const result = addShipsHandler(msg.data)
              
                if (result.error) {
                  return [mapToResponse('error', JSON.stringify(result))]
                }
                
                return [mapToResponse('add_ships', JSON.stringify({ success: true }))]
            }
            case 'attack': {
                const result = attackHandler(msg.data)
              
                if (result.error) {
                  return [mapToResponse('error', JSON.stringify(result))]
                }
                
                return []
            }
            case 'randomAttack': {
                const result = attackHandler(msg.data, true)
              
                if (result.error) {
                  return [mapToResponse('error', JSON.stringify(result))]
                }
                
                return []
            }
            default:
                return [{ type: 'unknown', data: 'Unknown message type', id: 0 }]
        }
    } catch (err) {
        return [
            {
                type: msg.type,
                id: 0,
                data: JSON.stringify({ error: 'Invalid message format' }),
              },
        ]
    }
}
