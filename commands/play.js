/* Play audio from a YouTube link */
const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

// check if user is in voice channel
// join voice channel
// add youtube link to queue
// play from queue

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays audio from a YouTube link"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
