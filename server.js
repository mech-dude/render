/*import { createPool, getConnection } from './models/db.js';
import { createNotionRouter } from './routers/notion-router.js'
import { createHelpscoutRouter } from './routers/helpscout-router.js'
import { getConversations } from './models/apphq-t2cases.js';
import { verifyUser, handleLogin, handleLogout, serveDashboard, serveAdminDashboard } from './controllers/authController.js';
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import express, { query } from 'express';
import cors from 'cors'
import bcrypt from 'bcrypt'
import pkg from 'jsonwebtoken';
const jwt = pkg;
import cookieParser from 'cookie-parser';
import fs from 'fs';
import https from 'https';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3306', 'https://render-client-cp7n.onrender.com', 'https://www.client.tsh-admin.site', 'http://192.168.1.11:3000', process.env.MYSQL_HOST],
  credentials: true
}));

// Initialize MySQL connection pool
createPool();

app.use('/dashboard', createNotionRouter())
app.use('/dashboard', createHelpscoutRouter())
app.post('/login', handleLogin);
app.get('/logout', handleLogout);
app.get('/dashboard', verifyUser, serveDashboard);
app.get('/admindashboard', verifyUser, serveAdminDashboard);

// Route for testing server status
app.get('/', (req, res) => res.send('Deployed! 🚀'));


import { client, ActivityType } from './models/discordClient.js';
import WebSocket from 'ws';
const botToken = process.env.BOT_TOKEN;
const guildId = process.env.GUILD_ID;
const clientId= process.env.CLIENT_ID;
const channelName = '✨t2-originals';

// Create a new WebSocket server
const wss = new WebSocket.Server({ port: 8090 }); // Choose a port for your WebSocket server


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
        ws.send(JSON.stringify(statusMessages));
    }

    // Function to handle WebSocket connection
    function handleConnection(ws) {
        console.log('WebSocket connection established.');

        // Call function to send data over WebSocket
        setInterval(() => {
            sendConnectionData(ws);
        }, 5000);

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


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
*/

import { createPool, getConnection } from './models/db.js';
import { createNotionRouter } from './routers/notion-router.js'
import { createHelpscoutRouter } from './routers/helpscout-router.js'
import { getConversations } from './models/apphq-t2cases.js';
import { verifyUser, handleLogin, handleLogout, serveDashboard, serveAdminDashboard } from './controllers/authController.js';
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })
import express, { query } from 'express';
import cors from 'cors'
import bcrypt from 'bcrypt'
import pkg from 'jsonwebtoken';
const jwt = pkg;
import cookieParser from 'cookie-parser';
import fs from 'fs';
import https from 'https';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3306', 'https://render-client-cp7n.onrender.com', 'https://www.client.tsh-admin.site', 'http://192.168.1.11:3000', process.env.MYSQL_HOST],
  credentials: true
}));

// Initialize MySQL connection pool
createPool();

app.use('/dashboard', createNotionRouter())
app.use('/dashboard', createHelpscoutRouter())
app.post('/login', handleLogin);
app.get('/logout', handleLogout);
app.get('/dashboard', verifyUser, serveDashboard);
app.get('/admindashboard', verifyUser, serveAdminDashboard);

// Route for testing server status
app.get('/', (req, res) => res.send('Deployed! 🚀'));


import { client, ActivityType } from './models/discordClient.js';
import WebSocket from 'ws';
const botToken = process.env.BOT_TOKEN;
const guildId = process.env.GUILD_ID;
const clientId= process.env.CLIENT_ID;
const channelName = '✨t2-originals';

// Determine WebSocket URL based on environment
const wsProtocol = process.env.NODE_ENV === 'production' ? 'wss://' : 'ws://';
const wsPort = process.env.NODE_ENV === 'production' ? process.env.PORT : '8090'; // Port for development
const wsHost = process.env.NODE_ENV === 'production' ? '0.0.0.0:' : 'localhost:';

const wsUrl = `${wsProtocol}${wsHost}${wsPort}`; // Build WebSocket server Url (for prod)

let wss; // Declare wss variable

if(process.env.NODE_ENV === 'production'){
    console.log('wsUrl:', wsUrl); 
    wss = new WebSocket(wsUrl); 
} else {
    // Create a new WebSocket server (for dev only)
    wss = new WebSocket.Server({ port: wsPort });
}


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
        }, 5000);

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


// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));