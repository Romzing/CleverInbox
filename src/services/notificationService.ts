import { IncomingWebhook } from "@slack/webhook";
import axios from "axios";
import { NotificationPayload } from "../types";
import { SLACK_WEBHOOK_URL, WEBHOOK_URL } from "../config/constants";

class NotificationService {
  private slackWebhook: IncomingWebhook | null;
  private webhookUrl: string | null;

  constructor() {
    // this.slackWebhook = new IncomingWebhook(SLACK_WEBHOOK_URL);
    this.slackWebhook = SLACK_WEBHOOK_URL
  ? new IncomingWebhook(SLACK_WEBHOOK_URL)
  : null;
    this.webhookUrl = WEBHOOK_URL;
  }

  public async sendSlackNotification(
    payload: NotificationPayload
  ): Promise<void> {
    if (!this.slackWebhook) {
      console.warn("SLACK_WEBHOOK_URL not set. Skipping Slack notification.");
      return;
    }

    try {
      await this.slackWebhook.send({
        text: "New 'Interested' email received",
        attachments: [
          {
            color: "#36a64f",
            fields: [
              {
                title: "Subject",
                value: payload.subject || "No Subject",
                short: false,
              },
              {
                title: "From",
                value: payload.from || "Unknown Sender",
                short: true,
              },
            ],
          },
        ],
      });
      console.log("Slack notification sent successfully.");
    } catch (error) {
      console.error("Error sending Slack notification:", error);
    }
  }

  public async triggerWebhook(payload: NotificationPayload): Promise<void> {
    if (!this.webhookUrl) {
      console.warn("WEBHOOK_URL not set. Skipping webhook trigger.");
      return;
    }

    try {
      await axios.post(this.webhookUrl, {
        type: "email.interested",
        ...payload,
      });
      console.log("Webhook triggered successfully.");
    } catch (error) {
      console.error("Error triggering webhook:", error);
    }
  }
}

export const notificationService = new NotificationService();
