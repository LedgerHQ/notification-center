import axios from 'axios';

// TODO: harmonize plugin interface
// TODO: .env?
const API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

// Gets user id from username
// This function can be optimized by storing id's inside the DB on first notifications
async function getUserId(handles: string[]): Promise<string[]> {
  const UserIds: string[] = [];

  try {
    const response = await axios.get(`${API_URL}/getUpdates`);
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
export async function notify(message: string, handles: string[]) {
  const chatId = await getUserId(handles);
  for (let i = 0; i < chatId.length; i++) {
    try {
      const res = await axios.post(`${API_URL}/sendMessage`, {
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
