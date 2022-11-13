const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs/promises");
const path = require("node:path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearcache")
    .setDescription("Clears saved audio cache"),
  async execute(interaction) {
    for (const file of await fs.readdir("./audio")) {
      await fs.unlink(path.join("./audio", file));
    }
    await interaction.reply("cleared");
  },
};
