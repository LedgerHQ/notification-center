export type User = {
  id: string; // wallet address
  channels: {
    telegrams: string[]; // Telegram handles
    emails: string[]; // Mail handles
  };
};

export type Values = {
  telegrams?: string[];
  emails?: string[];
};

export type payload = {
  walletAddress: string;
  values: Values;
  timestamp: number;
  signature: string;
  publicKey: string;
};

export type ToType = 'telegram' | 'mail';

export type NotificationPayload = {
  to: string; // define the public key that will receive the notification
  message: string; // define the message the signer will receive
};
