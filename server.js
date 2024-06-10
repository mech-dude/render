import {
  client,
  ActivityType,
  WebhookClient,
  EmbedBuilder,
  Events,
  ModalBuilder,
  Collection,
  ActionRowBuilder,
} from "./models/discordClient.js";
import { ping, opencase } from "./commands/utility/slashCommands.js";
import { openCaseButton, closeCaseButton } from "./commands/utility/buttons.js";
import {
  convertTo24Hour,
  timeStringToSeconds,
} from "./models/timeFunctions.js";

import { getConversations } from "./models/apphq-t2cases.js";
import { app, io } from "./http-server.js";

app.listen(process.env.PORT, () =>
  console.log(`Server listening on port ${process.env.PORT}`)
);

const bot = {
  token: process.env.BOT_TOKEN,
  guildId: process.env.GUILD_ID,
  clientId: process.env.CLIENT_ID,
};

const channelName = "✨t2-originals";
const channelId = "969306866708512838";
const caseTimes = {};

// Initialize the buttons map
client.buttons = new Collection();
client.login(bot.token);

client.once(Events.ClientReady, async () => {
  // Set bot status and activity
  client.user.setPresence({
    status: "online",
    activities: [{ name: "you...", type: ActivityType.Watching }],
  });
  //client.user.setStatus('online')
  console.log(
    `${client.user.username} Bot is ready!\nBot Status: ${client.user.presence.status}`
  );

  // Initialize a map to store the previous status of each user
  const previousStatus = new Map();

  client.application.commands.create(ping);
  client.application.commands.create(opencase);

  //Print all channels in TSH
  client.channels.cache.forEach((channel) => {
    //console.log(channel.name);
    if (channel.name === "✨t2-originals") {
      //console.log(channel.messages)
    }
  });

  client.on("presenceUpdate", (oldPresence, newPresence) => {
    // Check if the presence update is for a member in the specific channel
    if (!newPresence.member) return;
    const member = newPresence.member;
    const userName = member.user.globalName;

    // Get the guild from the member
    const guild = member.guild;

    // Check if the guild contains the channel with the specified name
    const channel = guild.channels.cache.find(
      (channel) => channel.name === channelName
    );
    if (channel) {
      channel.members.forEach((channelmember) => {
        if (
          channelmember.user.globalName === userName &&
          channelmember.user.globalName != null
        ) {
          // If the member is in the specific channel, proceed with status update handling
          const oldStatus = previousStatus.get(userName) || "offline";
          const newStatus = newPresence.status || "offline";

          // If the status has changed, update the status for the user
          if (oldStatus !== newStatus) {
            // Update the previous status map
            previousStatus.set(userName, newStatus);

            // Log the status update for the individual user
            console.log(
              `Status updated for ${userName} in ${channelName}: ${oldStatus} -> ${newStatus}`
            );
          }
        }
      });
    }
  });

  client.on("messageUpdate", function (oldMessage, newMessage) {
    console.log({ oldMessage, newMessage }, "updated a message")

  });

  //Search users in specific channel
  function sendConnectionData(ws) {
    // Initialize an empty array to store status messages
    let statusMessages = [];

    // Your existing logic to fetch data from guilds
    client.guilds.cache.forEach((guild) => {
      let channel = guild.channels.cache.find(
        (channel) => channel.name === channelName
      );
      if (!channel) return;

      channel.members.forEach((member) => {
        let statusObj = {};
        statusObj[member.user.globalName] =
          member.presence?.status || "offline";
        statusMessages.push(statusObj);
      });
    });

    io.send("", { type: "status", data: statusMessages });
    //ws.send(JSON.stringify({ type: 'status', data: statusMessages }));
  }

  // Function to send both connection data and conversations data over WebSocket
  function sendDataOverWebSocket(ws) {
    // Get conversations data
    

    // Send connection data over WebSocket
    sendConnectionData(ws);
  }

  // Function to handle WebSocket connection
  function handleConnection(socket) {
    console.log("WebSocket connection established.");

    // Event handler for messages received from WebSocket clients
    socket.on("message", function incoming(message) {
      console.log(
        "Received message from WebSocket client:",
        message.toString("utf8")
      );
      sendDataOverWebSocket(ws);
    });

    // Event handler for WebSocket connection closing
    socket.on("close", function close() {
      console.log("WebSocket connection closed.");
    });
  }

  // Event handler for when a WebSocket connection is established
  io.on("connection", (socket) => {
    console.log("Socket connedtec", socket)
  });

  // Event handler for WebSocket server errors
  io.on("error", function error(err) {
    console.error("WebSocket server encountered an error:", err);
  });

  // Event handler for WebSocket server close
  io.on("close", function close() {
    console.log("WebSocket server closed.");
  });
});


client.on(Events.MessageCreate, (createdMessage) => {
  try {
    if (createdMessage.author.globalName === null) return;
    console.log("Created Message:", createdMessage.author.globalName);
    console.log(
      `${createdMessage.author.globalName}: ${createdMessage.content}`
    );
  } catch (error) {
    console.error("Error handling message:", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // Check if the interaction is a command
    //if (!interaction.isCommand()) return;

    // Extract the command name
    const commandName = interaction.commandName;

    // Process different commands
    if (commandName === "ping") {
      await interaction.reply("Pong!");
    } else if (commandName === "opencase") {
      // Get the case number value
      const caseNumber = interaction.options.getNumber("case_number");

      client.buttons.set("close", {
        execute: async (interaction, client) => {
          const currentTimeClose = new Date().toLocaleTimeString();

          // Retrieve the original embed
          const originalEmbed = interaction.message.embeds[0];

          if (caseTimes[caseNumber]) {
            caseTimes[caseNumber].closeTime = currentTimeClose;
            console.log(caseTimes);
          } else {
            console.error(`Case number ${caseNumber} not found in caseTimes.`);
          }

          console.log(
            `${
              interaction.member.user.globalName
            } closed case#: ${caseNumber} at ${currentTimeClose}, ${new Date().toDateString()}`
          );

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

            console.log(
              `Time spent: ${hoursSpent} hours, ${minutesSpent} minutes, ${secondsSpent} seconds`
            );

            // Create a new embed based on the original, modifying its content
            const updatedEmbed = new EmbedBuilder(originalEmbed)
              .setDescription(
                `${interaction.member.user.globalName} closed case #${caseNumber}`
              )
              .setFooter({
                text: `Time spent: ${hoursSpent} hours, ${minutesSpent} minutes, ${secondsSpent} seconds`,
                iconURL: "https://i.imgur.com/AfFp7pu.png",
              });

            // Edit the message to remove the button and update the embed
            await interaction.update({
              embeds: [updatedEmbed],
              components: [], // This removes all components, including buttons
            });
          }
        },
      });

      // Check if the case number is a valid number
      if (isNaN(caseNumber)) {
        await interaction.reply("Please enter a valid case number.");
      } else {
        const currentTimeOpen = new Date().toLocaleTimeString();
        console.log(
          `${
            interaction.member.user.globalName
          } opened case#: ${caseNumber} on ${currentTimeOpen}, ${new Date().toDateString()}`
        );

        caseTimes[caseNumber] = {
          user: interaction.member.user.globalName,
          openTime: currentTimeOpen,
        };

        //await interaction.reply(`Case number: ${caseNumber}`);
        const embed = new EmbedBuilder()
          .setTitle("Case Tracker")
          .setColor("#69cccb")
          .setURL("https://i.imgur.com/95bnVWD.jpeg")
          .setAuthor({
            name: interaction.member.user.globalName,
            iconURL: interaction.user.avatarURL(),
          })
          .setDescription(`Case number: ${caseNumber}`)
          .setThumbnail("https://i.imgur.com/95bnVWD.jpeg");

        await interaction.reply({
          /*content: `Case number: ${caseNumber}`,*/
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(closeCaseButton)],
        });
      }
    }

    if (interaction.isButton()) {
      const { buttons } = client;
      const { customId } = interaction;

      if (!buttons) {
        console.error("Buttons map is not initialized");
        return;
      }

      const button = buttons.get(customId);

      if (!button) {
        console.error("There is no code for this button.");
        return;
      }

      try {
        await button.execute(interaction, client);
      } catch (error) {
        console.error("Error executing button:", error);
      }
    }
  } catch (error) {
    console.error(error);
  }
});
