import TelegramConnector from './telegram';
import IFTTTConnector from './iftt';
import { ConnectorList } from '../types';

const connectors: ConnectorList = {
  telegram: new TelegramConnector(process.env.TELEGRAM_TOKEN),
  ifttt: new IFTTTConnector(),
};

export default connectors;
