export interface AccountConfig extends ImapFlowOptions {
  id: string;
}

export interface NotificationPayload {
  subject?: string;
  from?: string;
  text?: string;
}
