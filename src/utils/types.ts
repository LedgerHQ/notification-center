export type ChannelsType = {
  telegrams: string[]; // Telegram handles
  emails: string[]; // Mail handles
  ifttts: string[]; // IFTTT webhook keys
};

export type ChannelsEnum = keyof ChannelsType;

export type User = {
  id: string; // wallet address
  channels: ChannelsType;
};

export type Payload = {
  walletAddress: string;
  values: ChannelsType;
  timestamp: number;
  signature: string;
  publicKey: string;
};

export type NotificationPayload = {
  to: string; // define the public key that will receive the notification
  message: string; // define the message the signer will receive
};
