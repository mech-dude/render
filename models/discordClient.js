import { ActivityType, Client, GatewayIntentBits, Partials, WebhookClient, EmbedBuilder, Events, ModalBuilder, Collection, SlashCommandBuilder  } from 'discord.js';

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.GuildMessages, Partials.Reaction]
});

export { client, ActivityType, WebhookClient, EmbedBuilder, Events, ModalBuilder, Collection, SlashCommandBuilder };