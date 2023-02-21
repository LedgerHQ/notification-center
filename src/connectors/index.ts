import { TelegramConnector } from './telegram';
import { IFTTTConnector } from './ifttt';
import { ConnectorList } from '../types';

const connectors: ConnectorList = {
  telegram: new TelegramConnector(),
  ifttt: new IFTTTConnector(),
};

export default connectors;
