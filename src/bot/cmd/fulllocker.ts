import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import User from "../../db/models/User";
import Profiles from "../../db/models/Profiles";
import { giveFullLocker } from "../../utils/handling/giveFullLocker";

export default {
  data: new SlashCommandBuilder()
    .setName("fulllocker")
    .setDescription("Give a user full locker!")
    .addStringOption((opt) =>
      opt.setName("user").setDescription("Users Discord ID").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const users = interaction.options.getString("user", true);
    try {
      const user = await User.findOne({ discordId: users });
      if (!user) {
        const embed = new EmbedBuilder()
          .setTitle("Core")
          .setDescription("Couldn't find the selected user.")
          .setColor("Red")
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], flags: 64 });
      }

      await giveFullLocker(user.accountId);

      const embed = new EmbedBuilder()
        .setTitle("Core")
        .setDescription("Successfully gave Full Locker!")
        .setColor("Green")
        .setTimestamp();

      return await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (err) {
      console.error(err);

      const embed = new EmbedBuilder()
        .setTitle("Core")
        .setDescription(
          "We ran into a error while giving full locker, please try again later."
        )
        .setColor("Red")
        .setTimestamp();

      return await interaction.reply({ embeds: [embed], flags: 64 });
    }
  },
};
