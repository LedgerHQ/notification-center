import axios from 'axios';
import IPlugin, { DefaultPlugin } from '../IPlugin';

class IFTTTPlugin extends DefaultPlugin implements IPlugin {
  #BASE_URL =
    'https://maker.ifttt.com/trigger/LEDGER_FRESH_EVENT/json/with/key/';

  constructor() {
    super(IFTTTPlugin.name);
  }

  async notify(message: string, targets: string[]): Promise<void> {
    // create an iterable of promises
    const requests = targets.map((target) =>
      axios.post(`${this.#BASE_URL}${target}`, { message })
    );

    // wait for all promises to resolve and get back the results and the status of all promises
    const responses = await Promise.allSettled(requests);

    // *OPINIONATED*: consider the notification as sent if at least one
    // of the requests has been fulfilled
    const isOneNotificationSent = responses.some(
      ({ status }) => status === 'fulfilled'
    );

    // if no notification has been sent, throw an error
    if (!isOneNotificationSent) this.throwError('➡️ IFTTT notification failed');
  }
}

export default IFTTTPlugin;
