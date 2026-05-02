import { Request, Response } from "express";
import EmailService from "../services/emailService";
import { AccountConfig } from "../types";

export const mailSyncController = async (req: Request, res: Response) => {
  try {
    if (
  !req.body?.id ||
  !req.body?.host ||
  !req.body?.port ||
  !req.body?.auth?.user ||
  !req.body?.auth?.pass
) {
  return res.status(400).json({
    message: "Missing required account fields"
  });
}
    const accConfig: AccountConfig = req.body;
    const emailService = new EmailService(accConfig);

    emailService.syncLast30Days().catch((err) => {
      console.error(`sync failed for account ${accConfig.id}:`, err);
    });

    res
      .status(200)
      .send({ message: "sync process started for the last 30 days." });
  } catch (error) {
    res.status(500).send({ message: "failed to start sync process.", error });
  }
};
