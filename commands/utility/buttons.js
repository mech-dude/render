import {  ActionRowBuilder, ButtonBuilder, ButtonStyle  } from '../../models/discordClient.js';

export const openCaseButton = new ButtonBuilder()
.setCustomId('submit')
.setLabel('Open Case')
.setStyle(ButtonStyle.Primary)

export const closeCaseButton = new ButtonBuilder()
.setCustomId('close')
.setLabel('Close Case')
.setStyle(ButtonStyle.Danger)

