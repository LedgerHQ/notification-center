import axios from 'axios';
import IConnector, { DefaultConnector } from '../IConnector';

type TelegramGetUpdateResponse = {
  result: [{ message: { from: { username: string; id: string } } }];
};
type telegramendMessageResponse = {
  result: { message: { message_id: string } };
};

/*
  NOTE:
  This Connector is not production ready at all, it was just a proof of concept.
  Why? Because it uses the getUpdates method of the Telegram API that fetch
  the last 100 messages received by the bot. Yes, only the last 100 messages,
  and users are not even unique, meaning someone can just spam the bot to remove
  others users from the stack.

  TODO:
  Here's the plan to refactor this plugin in order to make it production ready:

  Instead of giving their username, users will give the id of the chat channel they have with the bot. 
  Using the channel id is the only way to send a message to a user. The API of Telegram doesn't allow us
  to send a message to a user by its username. The problem is that it is impossible to retrieve this id 
  directly from the Telegram interface. However the bot knows this information everytime it receives a 
  new new message. So here's the plan:

  Develop a Telegram bot in the repository of the Telegram connectors (will be dockerised with everything else)
  - The bot must listen `getUpdates` event by webhooks
  - Everytime a new message is received by the bot, it will respond with a step-by-step guide that explains users 
    how to receive Telegram notification. This message will include the channel id, this id is the id that must be passed in Fresh UI.
  - Same flow than before, Fresh will interact with this server by calling `updateUser` everytime an user fills in a new channel.
  - Rate limit update from the same channel id (to avoid spam)

  Official Telegram documentation: https://core.telegram.org/bots/api
  Official Telegram documentation -- getUpdate method: https://core.telegram.org/bots/api#getupdates
*/
class TelegramConnector extends DefaultConnector implements IConnector {
  #BASE_URL;

  constructor(telegramToken: string) {
    super(TelegramConnector.name);
    this.#BASE_URL = `https://api.telegram.org/bot${telegramToken}`;
  }

  async #getUserId(targets: string[]): Promise<string[]> {
    // this shit load the last 100 messages received by the bot
    // meaning the implementation doesn't scale at all, take a look to
    // the README file of the project to see how to improve this
    // For the moment, this connector is not considered as production ready
    const response = await axios.get<TelegramGetUpdateResponse>(
      `${this.#BASE_URL}/getUpdates`
    );
    const chats = response.data.result;

    // get the user id of the targetted users
    const UserIds = chats.reduce((acc: string[], curr) => {
      const isIncluded = targets.includes(curr.message.from.username);
      return isIncluded ? [...acc, curr.message.from.id] : acc;
    }, []);

    // throw an error if users cannot be found (meaning targetted users didn't start a conversation with the bot)
    // *OPINIONATED*: we only throw an error if all of the targetted users has not started a conversation with the bot
    if (UserIds.length === 0)
      this.throwError('➡️ User did not started conversation with the bot');

    return UserIds;
  }

  async notify(message: string, targets: string[]): Promise<void> {
    const endpoint = `${this.#BASE_URL}/sendMessage`;
    const chatIds = await this.#getUserId(targets);

    // create an iterable of promises
    const requests = chatIds.map((id) =>
      axios.post<telegramendMessageResponse>(endpoint, {
        chat_id: id,
        text: message,
      })
    );

    // wait for all promises to resolve and get back the results and the status of all promises
    const responses = await Promise.allSettled(requests);

    // *OPINIONATED*: consider the notification as sent if at least one
    // of the requests has been fulfilled
    const isOneNotificationSent = responses.some(
      ({ status }) => status === 'fulfilled'
    );

    // if no notification has been sent, throw an error
    if (!isOneNotificationSent)
      this.throwError('➡️ Telegram notification failed');
  }
}

export default TelegramConnector;
