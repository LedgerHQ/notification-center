import { NotificationPayload, payload, User, Values } from './utils/types';
import { getUser, updateUser } from './database';
import { telegramPlugin } from './plugins/telegram/telegramPlugin';
import { emailPlugin } from './plugins/email/emailPlugin';

export function getServices(user: User): Values {
  return user.channels;
}

export function getTelegramHandles(user: User): string[] {
  return user.channels.telegrams;
}

export function getEmailHandles(user: User): string[] {
  return user.channels.emails;
}

export async function sendNotifications(
  payload: NotificationPayload
): Promise<User | null> {
  try {
    const user = await getUser(payload.to);
    if (!user) return null;
    else {
      const services = getServices(user);
      if (services.telegrams) {
        // Sending notification message to the telegram handles
        console.log('➡️ Telegram handles detected');
        telegramPlugin(payload.message, getTelegramHandles(user));
      }
      if (services.emails) {
        // Sending notification message to the email handles
        console.log('➡️ Mail handles detected');
        // Uncomment this to work on mail notification plugin
        // emailPlugin(payload.message, getEmailHandles(user));
      }
      return user as User;
    }
  } catch (err) {
    console.log('➡️ The following error ocurred : ', err);
    return null;
  }
}
