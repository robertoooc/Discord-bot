const {
  SlashCommandBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
} = require("discord.js");
const db = require("../../models");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("getresults")
    .setDescription("Get Results to all Job Postings"),
  async execute(interaction) {
    const getResults = await db.User.findOne({
      discordId: interaction.user.id,
    }).select("jobs");
    if (!getResults) {
      return interaction.reply({
        content: "You have no job postings to view!",
        ephemeral: true,
      });
    }

    const waiting = getResults.jobs.filter((job) => job.status === "waiting");
    const accepted = getResults.jobs.filter((job) => job.status === "accepted");
    const rejected = getResults.jobs.filter((job) => job.status === "rejected");

    const embeddedMessage = new EmbedBuilder()
      .setTitle("Job Postings")
      .setDescription("Here are your job postings")
      .addFields(
        {
          name: "Total Jobs Applied to",
          value: `${getResults.jobs.length}`,
        },
        {
          name: "Jobs Waiting Response ⏳",
          value: `${waiting.length}`,
          inline: true,
        },
        {
          name: "Jobs Accepted ✅",
          value: `${accepted.length}`,
          inline: true,
        },
        {
          name: "Jobs Rejected ❌",
          value: `${rejected.length}`,
          inline: true,
        }
      )

    const seeAll = new ButtonBuilder()
      .setCustomId("see_all")
      .setLabel("See All Jobs")
      .setStyle("Primary");

    const waitingButton = new ButtonBuilder()
      .setCustomId("waiting_button")
      .setLabel("See Waiting Response ⏳ Jobs")
      .setStyle("Secondary");

    const acceptedButton = new ButtonBuilder()
      .setCustomId("accepted_button")
      .setLabel("See Accepted ✅ Jobs")
      .setStyle("Success");

    const rejectedButton = new ButtonBuilder()
      .setCustomId("rejected_button")
      .setLabel("See Rejected ❌ Jobs")
      .setStyle("Danger");

    const row = new ActionRowBuilder().setComponents(
      seeAll,
      waitingButton,
      acceptedButton,
      rejectedButton
    );

    try {
      const fetchReply = await interaction.reply({
        embeds: [embeddedMessage],
        components: [row],
        fetchReply: true,
        ephemeral: true,
      });

      const collectResponse = await fetchReply.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 300000,
      });

      const filterJobsByStatus = (status) => {
        return getResults.jobs
          .filter((job) => job.status === status)
          .map((job) => {
            let val, link;
            job.link
              ? (link = `[Link](${job.link})`)
              : (link = "No Link Provided");

            if (job.status === "waiting") {
              val = "waiting ⏳";
            } else if (job.status === "accepted") {
              val = "accepted ✅";
            } else if (job.status === "rejected") {
              val = "rejected ❌";
            }

            return {
              name: job.name,
              value: `${val} - ${link}`,
            };
          });
      };

      if (collectResponse.customId === "see_all") {
        const allJobs = filterJobsByStatus("waiting")
          .concat(filterJobsByStatus("accepted"))
          .concat(filterJobsByStatus("rejected"));

        const embeddedMessage = new EmbedBuilder()
          .setTitle("All Job Postings")
          .setDescription("Here are your job postings")
          .addFields(allJobs);

        await collectResponse.reply({
          embeds: [embeddedMessage],
          ephemeral: true,
        });
      } else if (collectResponse.customId === "waiting_button") {
        const waitingJobs = filterJobsByStatus("waiting");

        const embeddedMessage = new EmbedBuilder()
          .setTitle("Waiting Response ⏳ Job Postings")
          .setDescription("Here are your job postings")
          .addFields(waitingJobs);

        await collectResponse.reply({
          embeds: [embeddedMessage],
          ephemeral: true,
        });
      } else if (collectResponse.customId === "accepted_button") {
        const acceptedJobs = filterJobsByStatus("accepted");

        const embeddedMessage = new EmbedBuilder()
          .setTitle("Accepted ✅ Job Postings")
          .setDescription("Here are your job postings")
          .addFields(acceptedJobs);

        await collectResponse.reply({
          embeds: [embeddedMessage],
          ephemeral: true,
        });
      } else if (collectResponse.customId === "rejected_button") {
        const rejectedJobs = filterJobsByStatus("rejected");

        const embeddedMessage = new EmbedBuilder()
          .setTitle("Rejected ❌ Job Postings")
          .setDescription("Here are your job postings")
          .addFields(rejectedJobs);

        await collectResponse.reply({
          embeds: [embeddedMessage],
          ephemeral: true,
        });
      }
    } catch (err) {
      console.log(err);
      await interaction.editReply({
        content: "An error occurred while getting your job postings.",
        ephemeral: true,
      });
    }
  },
};
