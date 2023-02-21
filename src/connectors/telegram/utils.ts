import axios, { AxiosResponse } from 'axios';

type telegramMessageResponse = {
  status: number;
  statusText: string;
  result: { message: { message_id: string } };
};

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export const sendMessage = async (
  chatId: string,
  text: string
): Promise<AxiosResponse<telegramMessageResponse, telegramMessageResponse>> => {
  try {
    // send a message to a chat
    const response = await axios.post<telegramMessageResponse>(
      `${TELEGRAM_API}/sendMessage`,
      {
        chat_id: chatId,
        text,
      }
    );

    // if the response status is not 200, throw an error
    if (response.status !== 200)
      throw new Error(`${response.status}: ${response.statusText}`);

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const setupWebhook = async () => {
  try {
    // the router defined in ./routes.ts is loaded on the /telegram path
    const webhookURL = `${process.env.SERVER_URL}/telegram/webhook/${TELEGRAM_TOKEN}`;
    const endpoint = `${TELEGRAM_API}/setWebhook?url=${webhookURL}&drop_pending_updates=true`;
    const response = await axios.get(endpoint);

    if (response.status !== 200)
      throw new Error(`${response.status}: ${response.statusText}`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
