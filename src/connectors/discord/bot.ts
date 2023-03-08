import {
  REST,
  Routes,
  SlashCommandBuilder,
  Client,
  Events,
  GatewayIntentBits,
  ChatInputCommandInteraction,
} from 'discord.js';

const { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = process.env;

class DiscordBot {
  bot: Client;
  commands: Array<{
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => void;
  }> = [];

  constructor() {
    // Create a new client instance
    this.bot = new Client({ intents: [GatewayIntentBits.Guilds] });

    // create SlashCommand
    this.commands.push({
      data: new SlashCommandBuilder()
        .setName('fresh')
        .setDescription('Get channel_id'),
      execute: async (interaction: ChatInputCommandInteraction) => {
        try {
          if (interaction.guildId) {
            // from guild channel
            const user = await this.bot.users.fetch(interaction.user.id);
            const msg = await user.send('Your channelId is');
            await user.send(msg.channelId);
          } else {
            // from DM
            await interaction.reply(
              `Your channelId is ${interaction.channelId}`
            );
          }
        } catch (error) {
          console.error(error);
        }
      },
    });
  }

  private registerCommands = async () => {
    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(DISCORD_BOT_TOKEN);

    try {
      console.log(`Started refreshing application (/) commands.`);

      // The put method is used to fully refresh all commands
      await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
        body: this.commands.map((i) => i.data.toJSON()),
      });

      console.log(`Successfully reloaded application (/) commands.`);
    } catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error(error);
    }
  };

  private registerEvents = () => {
    // When the client is ready, run this code (only once)
    // We use 'c' for the event parameter to keep it separate from the already defined 'client'
    this.bot.once(Events.ClientReady, (c) => {
      console.log(`Discord Bot Ready! Logged in as ${c.user.tag}`);
    });

    // handle commands
    this.bot.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.find(
        (c) => c.data.name === interaction.commandName
      );

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
          });
        }
      }
    });
  };

  start = async () => {
    await this.registerCommands();
    await this.registerEvents();

    // Log in to Discord with DISCORD_BOT_TOKEN
    this.bot.login(DISCORD_BOT_TOKEN);
  };
}

const discordBot = new DiscordBot();
export default discordBot;
