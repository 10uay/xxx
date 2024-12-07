import express from "express";
import {
  addEvent,
  getEvents,
  editEvent,
  removeEvent,
  getAllEvents,
} from "../controllers/event.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyAdmin.js";

const router = express.Router();

router.post("/add-event", verifyToken, verifyAdmin, addEvent);
router.post("/get-event", verifyToken, verifyAdmin, getEvents);
router.put("/edit-event", verifyToken, verifyAdmin, editEvent);
router.delete("/remove-event", verifyToken, verifyAdmin, removeEvent);

router.get("/get-all-events", getAllEvents);

export default router;
