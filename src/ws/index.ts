import { WebSocketServer } from 'ws'
import { Message } from './types';
import { handleMessage } from './handlers';
import { logout } from '../db/users';


export const createWSS = (port: number) => {
    const wss = new WebSocketServer({ port })

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection')

        ws.on('message', (message) => {
            try {
                const msg: Message = JSON.parse(message.toString());
                console.log('msg:', msg)
                const response = handleMessage(ws, msg)
                console.log('response:', response)

                const resultResponse = { type: msg.type, id: 0, data: response }
                
                ws.send(JSON.stringify(resultResponse))
            } catch (err) {
                ws.send(JSON.stringify({ type: 'reg', data: JSON.stringify('Invalid message format'), id: 0 }));
            }
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed')
            logout(ws)
        });
    });
}