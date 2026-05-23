import { Router } from "express";
import { getMessages } from "../controllers/message.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

export const messageRoute: Router = Router();

messageRoute.post("/", verifyToken, getMessages);