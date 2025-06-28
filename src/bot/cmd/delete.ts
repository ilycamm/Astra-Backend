import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import User from "../../db/models/User";
import Profiles from "../../db/models/Profiles";
import createProfiles from "../../utils/creationTools/createProfiles";

export default {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete your Core account"),
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const user = await User.findOne({ discordId: interaction.user.id });
      if (!user) {
        await interaction.reply({
          content: `No account found!`,
          flags: 64,
        });
        return;
      }

      const profile = await Profiles.findOne({ accountId: user?.accountId });
      if (!profile) {
        await interaction.reply({
          content: `No profile found!`,
          flags: 64,
        });
        return;
      }

      await profile.deleteOne();
      await user.deleteOne();

      await interaction.reply({
        content: `Deleted Account!`,
        flags: 64,
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "Account Could Not Be Deleted",
        flags: 64,
      });
    }
  },
};
