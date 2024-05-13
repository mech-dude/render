import { client, ActivityType } from './models/discordClient.js';
import { getConversations } from './models/apphq-t2cases.js';
import { WebSocketServer } from 'ws';
import * as http from 'http';
import * as https from 'https'
import app from './http-server.js';


const botToken = process.env.BOT_TOKEN;
const guildId = process.env.GUILD_ID;
const clientId= process.env.CLIENT_ID;
const channelName = '✨t2-originals';

let server;
let wss;

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
    server = http.createServer();
    wss = new WebSocketServer({server: server});
} else {
    server = http.createServer();
    wss = new WebSocketServer({server: server});
}

// Also mount the app here
server.on('request', app);

server.listen(process.env.PORT, function() {
    const address = server.address(); // Get server address information
    console.log("This is the server address", address)
    console.log(`http/ws server listening on port ${process.env.PORT}`);
});

client.once('ready', () => {

    // Set bot status and activity
    client.user.setPresence({
        //status: 'invisible',
        activities: [{ name: 'you...' , type: ActivityType.Watching}]
    });
    client.user.setStatus('idle')
    console.log(`${client.user.username} Bot is ready!\nBot Status: ${client.user.presence.status}`);

    //Search users in specific channel
    function sendConnectionData(ws) {
        // Initialize an empty array to store status messages
        let statusMessages = [];
    
        // Your existing logic to fetch data from guilds
        client.guilds.cache.forEach((guild) => {
            guild.channels.cache.forEach((channel) => {
                if (channel.name === channelName) {
                    channel.members.forEach((member) => {
                        let statusObject = {};
                        if (member.presence?.status === undefined) {
                            statusObject[member.user.globalName] = 'offline';
                        } else {
                            statusObject[member.user.globalName] = member.presence.status;
                        }
                        // Push the status object to the array
                        statusMessages.push(statusObject);
                    });
                }
            });
        });
    
        // Send the array of status messages to the client
        //ws.send(JSON.stringify(statusMessages));
        ws.send(JSON.stringify({ type: 'status', data: statusMessages }));
    }

    // Function to send both connection data and conversations data over WebSocket
    function sendDataOverWebSocket(ws) {
      // Get conversations data
      getConversations()
          .then(conversations => {
              // Send the conversations data over the WebSocket connection
              ws.send(JSON.stringify({ type: 'conversationCount', data: conversations }));
          })
          .catch(error => {
              console.error('Error retrieving conversations:', error);
              // Optionally, send an error message over the WebSocket
              ws.send(JSON.stringify({ error: 'Internal Server Error' }));
          });

      // Send connection data over WebSocket
      sendConnectionData(ws);
    }

    // Function to handle WebSocket connection
    function handleConnection(ws) {
        console.log('WebSocket connection established.');

        // Call function to send data over WebSocket
        setInterval(() => {
          sendDataOverWebSocket(ws);
        }, 2000);

        // Event handler for messages received from WebSocket clients
        ws.on('message', function incoming(message) {
            console.log('Received message from WebSocket client:', message.toString('utf8'));
        });

        // Event handler for WebSocket connection closing
        ws.on('close', function close() {
            console.log('WebSocket connection closed.');
        });

    }
    

    // Event handler for when a WebSocket connection is established
    wss.on('connection', handleConnection);

    // Event handler for WebSocket server errors
    wss.on('error', function error(err) {
        console.error('WebSocket server encountered an error:', err);
    });

    // Event handler for WebSocket server close
    wss.on('close', function close() {
        console.log('WebSocket server closed.');
    });

});

client.login(botToken);