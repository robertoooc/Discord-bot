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
    if (!getResults)
      return interaction.reply({
        content: "You have no job postings to view!",
      });

    const waiting = getResults.jobs.filter((job) => job.status == "waiting");
    const accepted = getResults.jobs.filter((job) => job.status == "accepted");
    const rejected = getResults.jobs.filter((job) => job.status == "rejected");

    console.log(waiting, accepted, rejected);
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
      );

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
      });

      const collectResponse = await fetchReply.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 60000,
      });
      console.log(collectResponse);
      console.log(collectResponse.customId);

      if (collectResponse.customId == "see_all") {
        const allJobs = getResults.jobs.map((job) => {
          let val, link;
          job.link
            ? (link = `[Link](${job.link})`)
            : (link = "No Link Provided");
          if (job.status == "waiting") {
            val = "waiting ⏳";
          } else if (job.status == "accepted") {
            val = "accepted ✅";
          } else if (job.status == "rejected") {
            val = "rejected ❌";
          }
          return {
            name: job.name,
            value: `${val} - ${link}`,
          };
        });

        const embeddedMessage = new EmbedBuilder()
          .setTitle("All Job Postings")
          .setDescription("Here are your job postings")
          .addFields(allJobs);

        await collectResponse.reply({
          embeds: [embeddedMessage],
        });
      } else if (collectResponse.customId == "waiting_button") {
        const waitingJobs = getResults.jobs
          .filter((job) => job.status == "waiting")
          .map((job) => {
            let val, link;
            job.link
              ? (link = `[Link](${job.link})`)
              : (link = "No Link Provided");
            if (job.status == "waiting") {
              val = "waiting ⏳";
            } else if (job.status == "accepted") {
              val = "accepted ✅";
            } else if (job.status == "rejected") {
              val = "rejected ❌";
            }
            return {
              name: job.name,
              value: `${val} - ${link}`,
            };
          });

        const embeddedMessage = new EmbedBuilder()
          .setTitle("Waiting Response ⏳ Job Postings")
          .setDescription("Here are your job postings")
          .addFields(waitingJobs);

        await collectResponse.reply({
          embeds: [embeddedMessage],
        });
      } else if (collectResponse.customId == "accepted_button") {
        const acceptedJobs = getResults.jobs
          .filter((job) => job.status == "accepted")
          .map((job) => {
            let val, link;
            job.link
              ? (link = `[Link](${job.link})`)
              : (link = "No Link Provided");
            if (job.status == "waiting") {
              val = "waiting ⏳";
            } else if (job.status == "accepted") {
              val = "accepted ✅";
            } else if (job.status == "rejected") {
              val = "rejected ❌";
            }
            return {
              name: job.name,
              value: `${val} - ${link}`,
            };
          });

        const embeddedMessage = new EmbedBuilder()
          .setTitle("Accepted ✅ Job Postings")
          .setDescription("Here are your job postings")
          .addFields(acceptedJobs);

        await collectResponse.reply({
          embeds: [embeddedMessage],
        });
      } else if (collectResponse.customId == "rejected_button") {
        const rejectedJobs = getResults.jobs
          .filter((job) => job.status == "rejected")
          .map((job) => {
            let val, link;
            job.link
              ? (link = `[Link](${job.link})`)
              : (link = "No Link Provided");
            if (job.status == "waiting") {
              val = "waiting ⏳";
            } else if (job.status == "accepted") {
              val = "accepted ✅";
            } else if (job.status == "rejected") {
              val = "rejected ❌";
            }
            return {
              name: job.name,
              value: `${val} - ${link}`,
            };
          });

        const embeddedMessage = new EmbedBuilder()
          .setTitle("Rejected ❌ Job Postings")
          .setDescription("Here are your job postings")
          .addFields(rejectedJobs);

        await collectResponse.reply({
          embeds: [embeddedMessage],
        });
      }
    } catch (err) {
      console.log(err);
      await interaction.editReply("Session Timed Out!");
    }
  },
};
