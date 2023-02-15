import axios from 'axios';
import IPlugin, { DefaultPlugin } from '../IPlugin';

type TelegramGetUpdateResponse = {
  result: [{ message: { from: { username: string; id: string } } }];
};
type telegramendMessageResponse = {
  result: { message: { message_id: string } };
};

class TelegramPlugin extends DefaultPlugin implements IPlugin {
  #BASE_URL;

  constructor(telegramToken: string) {
    super(TelegramPlugin.name);
    this.#BASE_URL = `https://api.telegram.org/bot${telegramToken}`;
  }

  async #getUserId(targets: string[]): Promise<string[]> {
    // this shit load all the conversations of the bot
    // meaning chats contains all the conversations started with the bot
    // that include username of all of our users
    // TODO: find a better way to handle this
    const response = await axios.get<TelegramGetUpdateResponse>(
      `${this.#BASE_URL}/getUpdates`
    );
    const chats = response.data.result;

    // get the user id of the targetted users
    //TODO: rewrite
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

export default TelegramPlugin;
