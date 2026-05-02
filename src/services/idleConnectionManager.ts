import EmailService from "./emailService";
import { AccountConfig } from "../types";
import { randomUUID } from "crypto";

class IdleConnectionManager {
  private static instance: IdleConnectionManager;
  private activeConnections: Map<string, EmailService> = new Map();

  private constructor() {}

  public static getInstance(): IdleConnectionManager {
    if (!IdleConnectionManager.instance) {
      IdleConnectionManager.instance = new IdleConnectionManager();
    }
    return IdleConnectionManager.instance;
  }

  public async startNewIdleConnection(
    accConfig: AccountConfig
  ): Promise<string> {
    const service = new EmailService(accConfig);
    await service.connect();
    service.startIdle("INBOX").catch((err) => {
      console.error(`[BACKGROUND_IDLE_ERROR] Account ${accConfig.id}:`, err);
    });

    const connectionId = randomUUID();
    this.activeConnections.set(connectionId, service);

    console.log(`Started new idle connection with ID: ${connectionId}`);
    return connectionId;
  }

  public async stopIdleConnection(connectionId: string): Promise<boolean> {
    const service = this.activeConnections.get(connectionId);
    if (service) {
      await service.stopMailSync();
      this.activeConnections.delete(connectionId);
      console.log(`Stopped idle connection with ID: ${connectionId}`);
      return true;
    }
    console.error(`No active idle connection found with ID: ${connectionId}`);
    return false;
  }
}

export const idleConnectionManager = IdleConnectionManager.getInstance();
