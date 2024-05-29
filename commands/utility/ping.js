import {  SlashCommandBuilder  } from '../../models/discordClient.js';

export const ping = new SlashCommandBuilder()
.setName('ping')
.setDefaultMemberPermissions("1")
.setDescription('Replies with Pong!')

export const opencase = new SlashCommandBuilder()
.setName('opencase')
.setDefaultMemberPermissions("1")
.setDescription('Register case number Id')
.addNumberOption( option =>
	option
	.setName("case_number")
	.setDescription("Enter your case number")
	.setRequired(true)
)