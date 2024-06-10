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
             // Send the array of status messages to the client
        //ws.send(JSON.stringify(statusMessages));
        //console.log(statusMessages);

        /*client.on('message', msg => {
        console.log(msg.channelId)
        if (msg.channel.id != channelId) return;
        const message_text = msg.content;

            console.log(message_text);

    });*/

    