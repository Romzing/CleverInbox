import { Router } from "express";
import { getEmailsController } from "../controllers/emailRead.controller";

const router = Router();

router.get("/", getEmailsController);

export default router;