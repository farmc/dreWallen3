const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops audio if currently playing"),
  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);
    if (connection) {
      connection.destroy();
      await interaction.reply("Stopped!");
    } else {
      await interaction.reply("No audio currently playing.");
    }
  },
};
