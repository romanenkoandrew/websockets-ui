import { IncomingMessage, RegData, MessageResponse } from '../types';
import { WebSocket } from 'ws';
import { loginByCredentials } from '../../db/users';
import { mapToResponse } from '../utils';
import { getWinnersHandlers } from './winners';

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
                    responses.push(getWinnersHandlers())
                }
                
                return responses
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
