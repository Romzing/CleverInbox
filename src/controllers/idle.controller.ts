import { Request, Response } from "express";
import { AccountConfig } from "../types";
import { idleConnectionManager } from "../services/idleConnectionManager";

export const startIdleController = async (req: Request, res: Response) => {
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
    const connectionId = await idleConnectionManager.startNewIdleConnection(
      accConfig
    );
    res
      .status(200)
      .send({ message: "idle service started successfully.", connectionId });
  } catch (error) {
    res.status(500).send({ message: "failed to start idle service.", error });
  }
};

export const stopIdleController = async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.body;
    if (!connectionId) {
      return res.status(400).send({ message: "connectionId is required." });
    }
    const stopped = await idleConnectionManager.stopIdleConnection(
      connectionId
    );
    if (stopped) {
      res
        .status(200)
        .send({ message: `Idle connection ${connectionId} stopped.` });
    } else {
      res.status(404).send({ message: "idle connection not found." });
    }
  } catch (error) {
    res.status(500).send({ message: "failed to stop idle service.", error });
  }
};
