import axios from 'axios';
import * as dotenv from 'dotenv'
import { NotificationPayload } from '../../utils/types';
dotenv.config()

export async function telegramPlugin(message: string, handles: string[]) {
  const apiUrl =  `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;
  console.log('ayaaaaaaaaah', handles)
  try {
        const res = await axios.post(`${apiUrl}/sendMessage`, {
            chat_id: handles[0],
            text: message
        });
        return res.status;
    } catch (error) {
        console.error(error);
        return error;
    }
}