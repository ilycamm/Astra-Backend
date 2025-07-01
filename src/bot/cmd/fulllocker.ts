import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import User from "../../db/models/User";
import Profiles from "../../db/models/Profiles";

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

      const profile = await Profiles.findOne({ accountId: user.accountId });
      if (!profile) {
        const embed = new EmbedBuilder()
          .setTitle("Core")
          .setDescription("Please contact support, your profile was not found.")
          .setColor("Orange")
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], flags: 64 });
      }

      const fullLocker = await Bun.file(
        "src/resources/utilities/allCosmetics.json"
      ).json();

      let athena = profile.profiles["athena"];
      athena.items = fullLocker;

      await profile?.updateOne({
        $set: { "profiles.athena.items": athena.items },
      });

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
