import { TelegramConnector } from './telegram';
import { IFTTTConnector } from './ifttt';
import { DiscordConnector } from './discord';
import { ConnectorList } from '../types';

const connectors: ConnectorList = {
  telegram: new TelegramConnector(),
  ifttt: new IFTTTConnector(),
  discord: new DiscordConnector(),
};

export default connectors;
