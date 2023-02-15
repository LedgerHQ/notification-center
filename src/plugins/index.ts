import TelegramPlugin from './telegram';
import IFTTTPlugin from './iftt';
import { PluginList } from '../types';

const plugins: PluginList = {
  // TODO: remove casting
  telegram: new TelegramPlugin(process.env.TELEGRAM_TOKEN as string),
  ifttt: new IFTTTPlugin(),
};

export default plugins;
