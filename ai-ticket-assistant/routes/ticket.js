import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { createTicket, getTicket, getTickets, markTicketDone } from "../controllers/ticket.js";

const router = express.Router();

router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.post("/", authenticate, createTicket);
router.patch("/:id/done", authenticate, markTicketDone);

export default router;
