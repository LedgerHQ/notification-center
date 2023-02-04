import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export async function createMessage(to: string, subject: string, body: string) {
  const str = [`To: ${to}`, `Subject: ${subject}`, '', body].join('\n');
  return new Buffer(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function sendMessage(to: string, subject: string, body: string) {
  try {
    const response = await axios.post(
      'https://www.googleapis.com/gmail/v1/users/userId/messages/send',
      {
        raw: createMessage(to, subject, body),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.EMAIL_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

export async function emailPlugin(message: string, handles: string[]) {
  for (let i = 0; i < handles.length; i++) {
    try {
      sendMessage(handles[i], 'Ledger fresh - Notification', message);
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
