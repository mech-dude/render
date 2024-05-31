import { client, ActivityType, WebhookClient, EmbedBuilder, Events, ModalBuilder, Collection, ActionRowBuilder } from './models/discordClient.js';
import { ping, opencase } from './commands/utility/slashCommands.js'
import { openCaseButton, closeCaseButton } from './commands/utility/buttons.js'
import {convertTo24Hour, timeStringToSeconds} from './models/timeFunctions.js'

import { getConversations } from './models/apphq-t2cases.js';
import { WebSocketServer } from 'ws';
import * as http from 'http';
import * as https from 'https'
import app from './http-server.js';

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
    console.log(`Server listening on port ${process.env.PORT}`);
});


const botToken = process.env.BOT_TOKEN;
const guildId = process.env.GUILD_ID;
const clientId= process.env.CLIENT_ID;
const channelName = '✨t2-originals';
const channelId= '969306866708512838'
const caseTimes = {};

/***************** WORKING WEBHOOK *******************/
/*const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/1240426620838482021/cmGNQ-B-oMjLsl7ll1hvobEFLWLR7LUBNup5lc6qooFdAYRKBPoR5TEHNpR0YqEPJnIy' });
const embed = new EmbedBuilder()
	.setTitle('The Originals')
	.setColor(0x00FFFF);

webhookClient.send({
	content: 'This is a test',
	username: 't2-originals-bot',
	avatarURL: 'https://i.imgur.com/AfFp7pu.png',
	embeds: [embed],
});*/
/***************** WORKING WEBHOOK END****************/


// Initialize the buttons map
client.buttons = new Collection();

client.login(botToken);

client.once(Events.ClientReady, async() => {

    // Set bot status and activity
    client.user.setPresence({
        status: 'online',
        activities: [{ name: 'you...' , type: ActivityType.Watching}]
    });
    //client.user.setStatus('online')
    console.log(`${client.user.username} Bot is ready!\nBot Status: ${client.user.presence.status}`);

    // Initialize a map to store the previous status of each user
    const previousStatus = new Map();

    client.application.commands.create(ping)
    client.application.commands.create(opencase)

    //Print all channels in TSH
    client.channels.cache.forEach((channel)=>{
        //console.log(channel.name);
        if(channel.name === '✨t2-originals'){
            //console.log(channel.messages)
        }
    })    

    client.on('presenceUpdate', (oldPresence, newPresence) => {
        /* Checks status from anyone on TSH
        if (newPresence.member) {
            const member = newPresence.member;
            const userName = member.user.globalName;

            // Get the previous status of the user
            const oldStatus = previousStatus.get(userName) || 'offline';
            const newStatus = newPresence.status || 'offline';

            // If the status has changed, update the status for the user
            if (oldStatus !== newStatus) {
                // Update the previous status map
                previousStatus.set(userName, newStatus);

                // Log the status update for the individual user
                console.log(`Status updated for ${userName} in TSH: ${oldStatus} -> ${newStatus}`);
            }
        }*/

        // Check if the presence update is for a member in the specific channel
        if (newPresence.member) {
            const member = newPresence.member;
            const userName = member.user.globalName;
    
            // Get the guild from the member
            const guild = member.guild;
    
            // Check if the guild contains the channel with the specified name
            const channel = guild.channels.cache.find(channel => channel.name === channelName);
            if(channel){               
                channel.members.forEach((channelmember) => {
                    if(channelmember.user.globalName === userName && channelmember.user.globalName != null){
                        // If the member is in the specific channel, proceed with status update handling
                        const oldStatus = previousStatus.get(userName) || 'offline';
                        const newStatus = newPresence.status || 'offline';
            
                        // If the status has changed, update the status for the user
                        if (oldStatus !== newStatus) {
                            // Update the previous status map
                            previousStatus.set(userName, newStatus);
            
                            // Log the status update for the individual user
                            console.log(`Status updated for ${userName} in ${channelName}: ${oldStatus} -> ${newStatus}`);
                        }
                    }
                })
            }
        }
    });

    client.on("messageUpdate", function(oldMessage, newMessage){
        console.log(`${oldMessage.member.user.username} updated a message`)
    });

    /*client.on('message', msg => {
        console.log(msg.channelId)
        if (msg.channel.id != channelId) return;
        const message_text = msg.content;

            console.log(message_text);

    });*/

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
        //console.log(statusMessages);
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

client.on(Events.MessageCreate, (createdMessage) => {
    try {
        if(createdMessage.author.globalName === null) return;
        console.log("Created Message:", createdMessage.author.globalName)
        //console.log(`${createdMessage.member.user.globalName}: ${createdMessage.content}`);
        console.log(`${createdMessage.author.globalName}: ${createdMessage.content}`);
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    try {
        // Check if the interaction is a command
        //if (!interaction.isCommand()) return;

        // Extract the command name
        const commandName = interaction.commandName;

        // Process different commands
        if (commandName === 'ping') {
            await interaction.reply('Pong!');
        } else if (commandName === 'opencase') {

            // Get the case number value
            const caseNumber = interaction.options.getNumber("case_number");
            /* Define a button handler WORKING
            client.buttons.set('close', {
                execute: async (interaction, client) => {
                    // Edit the message to remove the button
                    await interaction.update({
                        content: `The case has been closed. #${caseNumber}`,
                        components: [] // This removes all components, including buttons
                    });
                    console.log(`${interaction.member.user.globalName} closed case#: ${caseNumber} at ${new Date().toLocaleTimeString()}, ${new Date().toDateString()}`)
                }
            });*/

            client.buttons.set('close', {
                execute: async (interaction, client) => {
                    const currentTimeClose = new Date().toLocaleTimeString();
         
                    // Retrieve the original embed
                    const originalEmbed = interaction.message.embeds[0];

                    if (caseTimes[caseNumber]) {
                        caseTimes[caseNumber].closeTime = currentTimeClose;
                        console.log(caseTimes)
                    } else {
                        console.error(`Case number ${caseNumber} not found in caseTimes.`);
                    }

                    console.log(`${interaction.member.user.globalName} closed case#: ${caseNumber} at ${currentTimeClose}, ${new Date().toDateString()}`);

                    if (caseTimes[caseNumber]) {
                        const openTime = caseTimes[caseNumber].openTime;

                        let cleanTimeStringOpen = convertTo24Hour(openTime);
                        let timeInSecondsOpen = timeStringToSeconds(cleanTimeStringOpen);

                        let cleanTimeStringClose = convertTo24Hour(currentTimeClose);
                        let timeInSecondsClose = timeStringToSeconds(cleanTimeStringClose);

                        // Calculate the time spent in seconds
                        let timeSpentInSeconds = timeInSecondsClose - timeInSecondsOpen;

                        // Convert the time spent back to hours, minutes, and seconds
                        let hoursSpent = Math.floor(timeSpentInSeconds / 3600);
                        timeSpentInSeconds %= 3600;
                        let minutesSpent = Math.floor(timeSpentInSeconds / 60);
                        let secondsSpent = timeSpentInSeconds % 60;

                        console.log(`Time spent: ${hoursSpent} hours, ${minutesSpent} minutes, ${secondsSpent} seconds`);

                        // Create a new embed based on the original, modifying its content
                        const updatedEmbed = new EmbedBuilder(originalEmbed)
                        .setDescription(`${interaction.member.user.globalName} closed case #${caseNumber}`)
                        .setFooter({ text: `Time spent: ${hoursSpent} hours, ${minutesSpent} minutes, ${secondsSpent} seconds`, iconURL: 'https://i.imgur.com/AfFp7pu.png' })
                
                        // Edit the message to remove the button and update the embed
                        await interaction.update({
                            embeds: [updatedEmbed],
                            components: [] // This removes all components, including buttons
                        });

                    }
            

            

                }
            });

            // Check if the case number is a valid number
            if (isNaN(caseNumber)) {
                await interaction.reply("Please enter a valid case number.");
            } else {
                const currentTimeOpen = new Date().toLocaleTimeString();
                console.log(`${interaction.member.user.globalName} opened case#: ${caseNumber} on ${currentTimeOpen}, ${new Date().toDateString()}`)

                caseTimes[caseNumber] = { 
                    user: interaction.member.user.globalName, 
                    openTime: currentTimeOpen
                };

                //await interaction.reply(`Case number: ${caseNumber}`);
                const embed = new EmbedBuilder()
                .setTitle('Case Tracker')
                .setColor('#69cccb')
                .setURL('https://i.imgur.com/95bnVWD.jpeg')
                .setAuthor({ name: interaction.member.user.globalName , iconURL: interaction.user.avatarURL()})
                .setDescription(`Case number: ${caseNumber}`)
                .setThumbnail('https://i.imgur.com/95bnVWD.jpeg')

                await interaction.reply({
                    /*content: `Case number: ${caseNumber}`,*/
                    embeds: [embed],
                    components: [ new ActionRowBuilder().addComponents(closeCaseButton)]
                });
            }
          
        }

        if (interaction.isButton()) {
            const { buttons } = client;
            const { customId } = interaction;
        
            if (!buttons) {
                console.error('Buttons map is not initialized');
                return;
            }
        
            const button = buttons.get(customId);
        
            if (!button) {
                console.error('There is no code for this button.');
                return;
            }
        
            try {
                await button.execute(interaction, client);
            } catch (error) {
                console.error('Error executing button:', error);
            }
        }
        

    } catch (error) {
        console.error(error);
    }
});
