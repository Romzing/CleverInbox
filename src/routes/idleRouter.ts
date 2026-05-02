import { Router } from "express";
import {
  startIdleController,
  stopIdleController,
} from "../controllers/idle.controller";

const idleRouter = Router();

// start idle for an account, returns an uid
idleRouter.post("/start", startIdleController);
// stop idle for an account using the uid
idleRouter.post("/stop", stopIdleController);

export default idleRouter;
