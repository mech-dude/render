import { ActivityType, Client, GatewayIntentBits, Partials, WebhookClient, EmbedBuilder, Events } from 'discord.js';

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});

export { client, ActivityType, WebhookClient, EmbedBuilder, Events };