const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('currentchannel')
		.setDescription('Shows the currently set update channel.'),
	async execute(interaction) {
		const configFilePath = './config.json';

		if (!fs.existsSync(configFilePath)) {
			await interaction.reply('No channel is currently set.');
			return;
		}

		const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

		if (!config.channelId) {
			await interaction.reply('No channel is currently set.');
			return;
		}

		await interaction.reply(`The currently set update channel is: <#${config.channelId}>`);
	},
};
