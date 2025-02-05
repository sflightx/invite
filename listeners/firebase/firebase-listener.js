const { EmbedBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, ButtonComponent } = require('discord.js');
const fs = require('fs');
const { database } = require('../../firebase-config.js');
const { ref, onValue } = require('firebase/database');

module.exports = {

    listenToFirebase: async function (client) {
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

        // Reference a specific path in Firebase (adjust as needed)
        const dbRef = ref(database, 'feed/v1');

        // Listen for changes in Firebase
        onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Extract the values
                const item = data.vJ9274fHfcu201Ra; // This assumes only one item; adjust if necessary
                const imageUrl = item.img;
                const title = item.title;
                const text = item.text;
                const link = item.link.jno;
        
                // Create the embed
                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(text)
                    .setColor(0x00AE86)
                    .setTimestamp()
                    .setImage(imageUrl);
        
                // Create the button
                const button = new ButtonBuilder()
                    .setLabel('Visit Link')
                    .setStyle(ButtonStyle.Link)
                    .setURL(link);  // Link button
        
                // Send the embed and button
                channel.send({ embeds: [embed], components: [{ type: 1, components: [button] }] })
                    .then(() => console.log('Embed and button successfully sent to the saved channel.'))
                    .catch(console.error);
            } else {
                console.log('No data available in Firebase.');
            }
        }, (error) => {
            console.error('Error listening to Firebase:', error);
        });
        
    }
};
