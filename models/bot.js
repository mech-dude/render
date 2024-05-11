import { client, ActivityType } from './model/discordClient.js';
import WebSocket from 'ws';
import dotenv from 'dotenv';
dotenv.config();
const botToken = process.env.BOT_TOKEN;
const guildId = process.env.GUILD_ID;
const clientId= process.env.CLIENT_ID;
const channelName = '✨t2-originals';

// Create a new WebSocket server
const wss = new WebSocket.Server({ port: 8080 }); // Choose a port for your WebSocket server


client.once('ready', () => {

    // ==========================================
    // ============== BOT ACTIVITY ==============
    // ==========================================


    // Set bot status and activity
    client.user.setPresence({
        //status: 'invisible',
        activities: [{ name: 'you...' , type: ActivityType.Watching}]
    });
    client.user.setStatus('idle')
    console.log(`${client.user.username} Bot is ready!\nBot Status: ${client.user.presence.status}`);

    // ==========================================
    // ============== BOT ACTIVITY END ==========
    // ==========================================

    //const guild = client.guilds.cache.get(guildId);
    //const alltshMembers = guild.members.cache.map(member => member.user.username).forEach((x) => {console.log(x)})


    // ==========================================
    // ============== WORKING 100% ==============
    // ==========================================

    // Online users from main tsh channel
    let [userCount, offlineCount, idleCount, dndCount, botsCount] = [0, 0, 0, 0, 0];
    let tshUsers = [];
    const userSearch = 'juanvictoria';
    
    client.guilds.cache.forEach((guild) => {
        // Check if the guild is "The Support Heroes"
        if (guild.name === "The Support Heroes") {
            guild.members.cache.forEach((member) => {
                tshUsers.push(member.user.tag);
    
                //Check user status for all members in tsh server
                if (member.presence?.status === undefined) {
                    offlineCount++;
                } else if (member.presence.status === 'online') {
                    userCount++;
                } else if (member.presence.status === 'idle') {
                    idleCount++;
                } else if (member.presence.status === 'dnd') {
                    dndCount++;
                }
    
                if (member.user.bot) {
                    botsCount++;
                }
            });
        }
    });
    

    // Search user with username in tsh server
    client.guilds.cache.some((guild) => {
        const member = guild.members.cache.find((member) => {
            let stat;
            
            if (member.user.tag === userSearch && member.guild.name === "The Support Heroes") {
                if (member.presence?.status === undefined) {
                    stat = "offline"
                } else if (member.presence.status === 'online') {
                    stat = "online"
                } else if (member.presence.status === 'idle') {
                    stat = "idle"
                } else if (member.presence.status === 'dnd') {
                    stat = "on Do Not Disturb"
                }
                //console.log(`${userSearch} is: ${stat}`);
                return true;
            }
        });
        return member;
    });

    // Show all channel names in tsh server
    client.guilds.cache.some((guild) => {
        //guild.channels.cache.forEach((e)=>{console.log(e.name)})
    });

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
                            statusObject[member.user.tag] = 'offline';
                        } else {
                            statusObject[member.user.tag] = member.presence.status;
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

    
    

    /*console.table([
        { Status: 'Online', Count: userCount + idleCount },
        { Status: 'Offline', Count: offlineCount },
        { Status: 'Idle', Count: idleCount },
        { Status: 'Do Not Disturb (DND)', Count: dndCount },
        { Status: 'Bots', Count: botsCount }
    ]);*/
    
    //console.log("Total users:", tshUsers.length);
    //console.log(tshUsers);


    // ==========================================
    // ============= END OF WORKING % ===========
    // ==========================================

    const originalsChannel = client.channels.cache.get('969306866708512838');
    const originalsChannelMembers = originalsChannel.members;
    // Iterate over channel members from t2-originals
    originalsChannelMembers.forEach(member => {
        //console.log(member.user.tag);
    });

    // Member presence from t2-originals
    client.channels.cache.get('969306866708512838').members.forEach((member)=> {
        //console.log(member.presence)
    });



    /*client.on('message', message => {
        const prefix = "!"; // Define prefix inside message event
        if (message.channel.id === '969306866708512838') {
            if (message.content.startsWith(prefix + "test")) {
                console.log("pass")
                const members = message.guild.members.cache.map(member => member.user.tag);
                console.log(members); // Log all members' usernames
            }
        }
    });*/

});

client.login(botToken);