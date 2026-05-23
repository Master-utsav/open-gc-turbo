import { Router } from "express";
import {authHandler} from "../controllers/auth.controller.js";

export const userRouter: Router = Router();

userRouter.post("/", authHandler);