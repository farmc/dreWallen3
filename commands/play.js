const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const {
  joinVoiceChannel,
  createAudioResource,
  createAudioPlayer,
  VoiceConnectionStatus,
  AudioPlayerStatus,
  getVoiceConnection,
} = require("@discordjs/voice");

async function joinAndPlay(interaction, filePath, link) {
  // check if user is in voice channel
  if (!interaction.member.voice.channel) {
    await interaction.reply("You are not in a voice channel!");
    return;
  }

  // clean up old connection if exists
  const old_connection = getVoiceConnection(
    interaction.member.voice.channel.guild.id
  );
  if (old_connection) old_connection.destroy();

  // create new connection and play audio
  const connection = joinVoiceChannel({
    channelId: interaction.member.voice.channel.id,
    guildId: interaction.member.voice.channel.guild.id,
    adapterCreator: interaction.member.voice.channel.guild.voiceAdapterCreator,
  });
  connection.on(VoiceConnectionStatus.Ready, () => {
    try {
      // set up player and audio file
      const player = createAudioPlayer();
      const resource = createAudioResource(filePath);
      player.play(resource);
      connection.subscribe(player);

      interaction.reply(`Playing ${link}`);
      console.log(`Playing ${link}`);

      // clean up
      player.on(AudioPlayerStatus.Idle, () => {
        player.stop();
        connection.destroy();
        console.log("Sucessful clean up");
      });
    } catch (err) {
      console.log(err);
      interaction.reply("Error while attempt to play file");
      connection.destroy();
    }
  });
}

// download to dreWallen3/audio
async function downloadAudio(link, videoId) {
  const filePath = `./audio/${videoId}.mp4`;
  let downloadNeeded = false;

  // Check if file already exists

  if (!fs.existsSync(filePath)) {
    downloadNeeded = true;
  } else console.log(`${filePath} already downloaded`);

  if (downloadNeeded) {
    console.log(`downloading from ${link}`);
    await new Promise((resolve) => {
      ytdl(link, { filter: "audioonly" })
        .pipe(fs.createWriteStream(`./audio/${videoId}.mp4`))
        .on("close", () => resolve());
    });
  }

  return filePath;
}

// return link
async function queryYouTube(query) {
  console.log(`Searching YouTube for "${query}"`);
  const search = await yts(query);
  return search.videos[0].url;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays audio from a YouTube link")
    .addStringOption((option) =>
      option.setName("link").setDescription("Link to YouTube video")
    )
    .addStringOption((option) =>
      option.setName("query").setDescription("Query to serach YouTube with")
    ),

  async execute(interaction) {
    const query = interaction.options.getString("query");
    let link = interaction.options.getString("link");

    // make sure exactly one paramter specified
    if ((!query && !link) || (query && link)) {
      await interaction.reply(`Provide either link or query, not both`);
      return;
    }

    // if no link perform search
    if (!link) link = await queryYouTube(query);

    // validate
    if (!ytdl.validateURL(link)) {
      // validate youtube link
      await interaction.reply(`${link} is not a valid YouTube link`);
      return;
    }
    const videoId = ytdl.getVideoID(link);
    const filePath = await downloadAudio(link, videoId);

    joinAndPlay(interaction, filePath, link);
  },
};
