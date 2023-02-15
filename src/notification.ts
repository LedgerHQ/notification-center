import {
  NotificationPayload,
  User,
  ChannelsType,
  ChannelsEnum,
} from './utils/types';
import { getUser } from './database';
import plugins from './plugins';

function getServices(user: User): ChannelsType {
  return user.channels;
}

function getHandles(user: User, channels: ChannelsEnum) {
  return user.channels[channels];
}

export async function sendNotifications(
  payload: NotificationPayload
): Promise<User | null> {
  try {
    const user = await getUser(payload.to);
    if (!user) return null;
    else {
      const services = getServices(user);
      if (services.telegrams?.length) {
        // Sending notification message to the telegram handles
        plugins.telegram.notify(payload.message, getHandles(user, 'telegrams'));
      }
      if (services.emails?.length) {
        // Sending notification message to the email handles
        // Uncomment this to work on mail notification plugin
        // emailPlugin.notify(payload.message, getHandles(user, "emails"));
      }
      if (services.ifttts?.length) {
        // Sending notification message to IFTTT
        plugins.ifttt.notify(payload.message, getHandles(user, 'ifttts'));
      }
      return user as User;
    }
  } catch (err) {
    console.log('➡️ The following error ocurred: ', err);
    return null;
  }
}
