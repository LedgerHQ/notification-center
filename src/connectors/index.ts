import TelegramConnector from './telegram';
import IFTTTConnector from './iftt';
import { ConnectorList } from '../types';

const connectors: ConnectorList = {
  // TODO: remove casting
  telegram: new TelegramConnector(process.env.TELEGRAM_TOKEN as string),
  ifttt: new IFTTTConnector(),
};

export default connectors;
