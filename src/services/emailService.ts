import { ImapFlow, ImapFlowOptions } from "imapflow";
import { simpleParser } from "mailparser";
import { AccountConfig } from "../types";
import { esClient } from "../utils/esClient";
import { categorizeEmail } from "../utils/categorizer";
import { notificationService } from "./notificationService";

class EmailService {
  private client: ImapFlow;
  private accConfig: AccountConfig;

  constructor(accConfig: AccountConfig) {
    this.accConfig = accConfig;
    this.client = new ImapFlow(this.accConfig as ImapFlowOptions);
    this.setupEventHandlers();
  }

  private setupEventHandlers = (): void => {
    this.client.on("close", () => {
      console.log(`Connection closed for: ${this.accConfig.id}.`);
    });

    this.client.on("error", (err) => {
      console.error(`${this.accConfig.id} Error:`, err);
    });

    this.client.on("exists", async (data) => {
      if (!this.client.mailbox) {
        console.error("No mailbox selected, cannot process new email.");
        return;
      }
      const currentMailbox = this.client.mailbox.path;
      try {
        const messages = this.client.fetch(data.count.toString(), {
          envelope: true,
          source: true,
        });
        for await (const msg of messages) {
          await this.processAndIndexEmail(msg, currentMailbox, true);
        }
      } catch (e) {
        console.error("Error processing new email:", e);
      }
    });
  };

  public connect = async (): Promise<void> => {
    console.log(`Connecting to account ${this.accConfig.id}`);
    try {
      if (!this.client.usable) {
        await this.client.connect();
        console.log(`Connection successful for ${this.accConfig.id}`);
      }
    } catch (e) {
      console.error(`Error connecting to account ${this.accConfig.id}`, e);
      throw e;
    }
  };

  public startIdle = async (folder: string = "INBOX"): Promise<void> => {
    try {
      await this.client.mailboxOpen(folder);
      if (!this.client.idling) {
        await this.client.idle();
        console.log(`Account ${this.accConfig.id} is now in idle mode.`);
      }
    } catch (e) {
      console.error(`Cannot idle for ${this.accConfig.id}`, e);
    }
  };

  public syncLast30Days = async (): Promise<void> => {
    console.log(`Starting 30-day sync for account ${this.accConfig.id}`);
    await this.connect();
    await this.fetchEmails({ emailFolder: "INBOX", days: 30 });
    // disconnect after sync is complete
    await this.stopMailSync();
    console.log(`Finished 30-day sync for account ${this.accConfig.id}`);
  };

  public fetchEmails = async ({
    emailFolder = "INBOX",
    days = 30,
  }: {
    emailFolder?: string;
    days?: number;
  } = {}): Promise<void> => {
    try {
      await this.client.mailboxOpen(emailFolder);
      const lastNDays = new Date();
      lastNDays.setDate(lastNDays.getDate() - days);

      const emailUids = await this.client.search({ since: lastNDays });

      if (emailUids && emailUids.length > 0) {
        // load email by converting array of emailUids to comma seperated uids
        await this.fetchEmailsByUID(emailUids.join(","), emailFolder);
      }
    } catch (e: unknown) {
      console.error(`error loading ${emailFolder} for ${this.accConfig.id}`);
    }
  };

  private fetchEmailsByUID = async (
    emailUids: string,
    folder: string
  ): Promise<void> => {
    try {
      const messages = this.client.fetch(emailUids, {
        envelope: true,
        source: true,
      });

      for await (const msg of messages) {
        await this.processAndIndexEmail(msg, folder, false);
      }
    } catch (e: unknown) {
      console.error(`error loading emails for ${this.accConfig.id}`, e);
    }
  };

  private processAndIndexEmail = async (
    msg: any,
    folder: string,
    shouldCategorize: boolean = false
  ): Promise<void> => {
    if (!msg.source) return;

    const parsedEmail = await simpleParser(msg.source);
    let category = "Uncategorized";

    if (shouldCategorize) {
  const result = await categorizeEmail(
    parsedEmail.subject || "No Subject",
    parsedEmail.text || ""
  );
  category = result.category;
  console.log(`[${this.accConfig.id}] New email categorized as: ${category}`);
}

    let toValue = "";
    if (parsedEmail.to) {
      if (Array.isArray(parsedEmail.to)) {
        toValue = (parsedEmail.to as any[])
          .map((t) => t.address || "")
          .join(", ");
      } else {
        toValue = (parsedEmail.to as any).text || "";
      }
    }

    if (category === "Interested") {
      const payload = {
        subject: parsedEmail.subject,
        from: parsedEmail.from?.text,
        text: parsedEmail.text,
      };

      Promise.allSettled([
        notificationService.sendSlackNotification(payload),
        notificationService.triggerWebhook(payload),
      ]);
    }

    await esClient.index({
      index: "emails-v2",
      id: `${this.accConfig.id}:${folder}:${msg.uid}`,
      document: {
        subject: parsedEmail.subject || "",
        from: parsedEmail.from?.text || "",
        to: toValue,
        date: parsedEmail.date || new Date(),
        text: parsedEmail.text || parsedEmail.html || "",
        messageId: parsedEmail.messageId || "",
        folder: folder,
        account_id: this.accConfig.id,
        category,
      },
    });
  };

  public stopMailSync = async (): Promise<void> => {
    console.log(`Logging out account ${this.accConfig.id}`);
    if (this.client.usable) {
      await this.client.logout();
    }
  };
}

export default EmailService;
