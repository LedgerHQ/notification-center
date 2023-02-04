import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const apiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

// Gets user id from username
// This function can be optimized by storing id's inside the DB on first notifications
export async function getUserId(handles: string[]): Promise<string[]> {
  let UserIds: string[] = [];

  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getUpdates`
    );
    const chats = response.data.result;
    if (chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        if (chats[i].message.from.username == handles[0])
          UserIds.push(chats[i].message.from.id);
      }
    } else {
      throw new Error('➡️ User has not started conversation with user');
    }
  } catch (error) {
    console.error(error);
  }
  return UserIds;
}

// Send the notification message from user chat Id
export async function telegramPlugin(message: string, handles: string[]) {
  const chatId = await getUserId(handles);
  for (let i = 0; i < chatId.length; i++) {
    try {
      const res = await axios.post(`${apiUrl}/sendMessage`, {
        chat_id: chatId[i],
        text: message,
      });
      console.log('➡️ Telegram notification sent to ' + handles[i]);
      return res.status;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
