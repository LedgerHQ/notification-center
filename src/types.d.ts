import IConnector from './connectors/IConnector';

type ChannelsType = {
  telegram: string[]; // Telegram handles
  ifttt: string[]; // IFTTT webhook keys
};

export type ChannelsEnum = keyof ChannelsType;

// namespace that groups all the object stored in the database
export declare namespace Database {
  type User = {
    id: string; // wallet address
    channels: ChannelsType;
  };
}

// namespace that groups all the payloads that can be sent to the server
export declare namespace Payload {
  type UpdateUser = {
    walletAddress: string;
    values: ChannelsType;
    timestamp: number;
    signature: string;
    publicKey: string;
  };
  type NotifyUser = {
    to: string; // define the public key that will receive the notification
    message: string; // define the message the signer will receive
  };
}

// Type that list the different connector defined and available in the connectors folder
export type ConnectorList = {
  [key in ChannelsEnum]: IConnector;
};
