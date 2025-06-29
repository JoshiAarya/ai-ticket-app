import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      console.log("[Inngest] on-ticket-created function triggered", event.data);
      const { ticketId } = event.data;

      //fetch ticket from DB
      const ticket = await step.run("fetch-ticket", async () => {
        console.log("[Inngest] Step: fetch-ticket", ticketId);
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      await step.run("update-ticket-status", async () => {
        console.log("[Inngest] Step: update-ticket-status", ticket._id);
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      console.log("[Inngest] Step: analyzeTicket (AI)");
      const aiResponse = await analyzeTicket(ticket);
      console.log("[Inngest] AI response:", aiResponse);

      const relatedskills = await step.run("ai-processing", async () => {
        console.log("[Inngest] Step: ai-processing");
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });
          skills = aiResponse.relatedSkills;
        }
        return skills;
      });

      const moderator = await step.run("assign-moderator", async () => {
        console.log("[Inngest] Step: assign-moderator", relatedskills);
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedskills.join("|"),
              $options: "i",
            },
          },
        });
        if (!user) {
          user = await User.findOne({
            role: "admin",
          });
        }
        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });
        return user;
      });

      await step.run("send-email-notification", async () => {
        console.log("[Inngest] Step: send-email-notification", moderator?.email);
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);
          await sendMail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you ${finalTicket.title}`
          );
        }
      });

      console.log("[Inngest] on-ticket-created function completed successfully");
      return { success: true };
    } catch (err) {
      console.error("❌ Error running the step", err.message, err);
      return { success: false };
    }
  }
);
