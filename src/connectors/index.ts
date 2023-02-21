import { TelegramConnector } from './telegram';
import IFTTTConnector from './iftt';
import { ConnectorList } from '../types';

const connectors: ConnectorList = {
  telegram: new TelegramConnector(),
  ifttt: new IFTTTConnector(),
};

export default connectors;
