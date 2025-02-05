const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, SlashCommandBuilder, ChannelType } = require('discord.js');
const fs = require('fs');

const { database } = require('../../firebase-config.js'); // Import Firebase config
const { ref, onValue } = require('firebase/database');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Setup necessary information where to deploy manifest updates.')
		.addChannelOption(option => 
			option.setName('channel')
				.setDescription('The channel to post all company updates in')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText)
		),
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel');

		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm')
			.setStyle(ButtonStyle.Success);

		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(cancel, confirm);

		await interaction.reply({
			content: `Do you want to set <#${channel.id}> as the update channel?`,
			components: [row],
		});

		const filter = i => i.customId === 'confirm' || i.customId === 'cancel';
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

		collector.on('collect', async i => {
			if (i.customId === 'confirm') {
				const configFilePath = './config.json';
				let config = {};

				if (fs.existsSync(configFilePath)) {
					config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
				}

				config.channelId = channel.id;
				fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

				await i.update({ content: `Update channel successfully set to <#${channel.id}>!`, components: [] });
			} else if (i.customId === 'cancel') {
				await i.update({ content: 'Action cancelled.', components: [] });
			}
		});

		collector.on('end', async collected => {
			if (collected.size === 0) {
				await interaction.editReply({ content: 'No response received. Action timed out.', components: [] });
			}
		});
	},
    sendEmbedToSavedChannel: async function (client) {
		const configFilePath = './config.json';
		if (!fs.existsSync(configFilePath)) {
			console.error('No config file found. Set up the channel first using the /setup command.');
			return;
		}

		const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
		const channelId = config.channelId;
		if (!channelId) {
			console.error('No channel ID found in the config. Set up the channel first using the /setup command.');
			return;
		}

		const channel = client.channels.cache.get(channelId);
		if (!channel) {
			console.error('The saved channel ID is invalid or the bot cannot access it.');
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle('Manifest Update')
			.setDescription('This is a test manifest update.')
			.setColor(0x00AE86)
			.setTimestamp();

		channel.send({ embeds: [embed] })
			.then(() => console.log('Embed successfully sent to the saved channel.'))
			.catch(console.error);
	}
};
