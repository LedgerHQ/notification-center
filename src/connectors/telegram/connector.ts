import IConnector, { DefaultConnector } from '../IConnector';
import { sendMessage } from './utils';

// This connector is used to send notifications to Telegram using stored chat_id
class TelegramConnector extends DefaultConnector implements IConnector {
  constructor() {
    super(TelegramConnector.name);
  }

  // targets is an array of Telegram chat_id
  async notify(message: string, targets: string[]): Promise<void> {
    // create an iterable of promises
    const requests = targets.map((target) => sendMessage(target, message));

    // wait for all promises to resolve and get back the results and the status of all promises
    const responses = await Promise.allSettled(requests);

    // *OPINIONATED*: consider the notification as sent if at least one
    // of the requests has been fulfilled
    const isOneNotificationSent = responses.some(
      ({ status }) => status === 'fulfilled'
    );

    // if no notification has been sent, throw an error
    if (!isOneNotificationSent)
      this.throwError('Impossible to reach the Telegram service');
  }
}

export default TelegramConnector;
