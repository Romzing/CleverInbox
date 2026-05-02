import { Router } from "express";
import { mailSyncController } from "../controllers/mailSync.controller";

const mailSyncRouter = Router();

mailSyncRouter.post("/", mailSyncController);

export default mailSyncRouter;


