import axios from 'axios';
import IConnector, { DefaultConnector } from '../IConnector';

/*
  NOTE: This connector use an event name. An event name is required when dealing with IFTTT's webhook applet.
  It allows IFTTT to filter request received by the webhook, that's why it is required.
  The problem is that in order to work, the event name entered by the user must be the same as the name
  used to request user's webhook (i.e defined in this connector!!). This is clearly a bad UX that can lead to some confusion.
  
  TODO:
  One solution to avoid that is to ask the user the name of the event to use and store it in the DB. 
  This forces us to save one more data in the database and adds a field for the user to fill in. Not ideal.

  Another solution would be to publish our own official Ledger Fresh applet in the store, and offer the user to use it.
  The applet must be customisable, only the first webhook brick must be pre-configured, including the event name that will
  be hardcoded. This solution solves the issue explain above AND it allows us to offer a better UX to the user. 
  I would prefer to go with this solution, but it requires some work on the IFTTT side.
  
  In any case, very detailled documentation is needed to explain how to use this connector.
*/
class IFTTTConnector extends DefaultConnector implements IConnector {
  #IFTTT_EVENT_NAME = 'LEDGER_FRESH_EVENT';
  #BASE_URL = `https://maker.ifttt.com/trigger/${
    this.#IFTTT_EVENT_NAME
  }/json/with/key/`;

  constructor() {
    super(IFTTTConnector.name);
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

export default IFTTTConnector;
