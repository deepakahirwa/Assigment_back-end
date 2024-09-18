import  { WebSocketServer } from 'ws'; // Import WebSocketServer from ws
import WebSocket from 'ws';
// Function to initialize WebSocket server
const initializeWebSocket = (server) => {
    const wss = new WebSocketServer({ server });
    const clients = new Set();
    const broadcast = (message) => {
        clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    };
    wss.on('connection', (ws) => {
        console.log('New WebSocket client connected');
        clients.add(ws);
        // Send a welcome message to the client
        ws.send('Hello from the WebSocket server!');

        // Handle incoming messages from clients
        ws.on('message', (message) => {
            // Check if the message is a buffer and convert it to a string
            const decodedMessage = Buffer.isBuffer(message) ? message.toString() : message;

            console.log('Received from client:', decodedMessage);

            // Send a response back to the client
            ws.send(`${decodedMessage}`);
            broadcast(`Broadcast message: ${decodedMessage}`);
        });

        // Handle client disconnect
        ws.on('close', () => {
            console.log('Client disconnected');
        });

        // Handle WebSocket errors
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });

    console.log('WebSocket server initialized');
};

export default initializeWebSocket;
