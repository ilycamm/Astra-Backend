import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import registerCommand from "./cmd/register";
import { Log } from "../utils/handling/logging";

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences],
  presence: {
    activities: [{ name: `Core`, type: ActivityType.Watching }],
  },
});

const commands = async () => {
  try {
    const cmds = [registerCommand.data.toJSON()];
    await client.application?.commands.set(cmds);
  } catch (error) {
    console.error(`Failed to register commands: ${error}`);
  }
};

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    try {
      switch (interaction.commandName) {
        case "register":
          await registerCommand.execute(interaction);
          break;
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "failed to execute comands",
        ephemeral: true,
      });
    }
  }
});

client.on("ready", async () => {
  await commands();
  Log(`Logged in as ${client.user?.tag}`);
});

client.login(process.env.BOT_TOKEN);
