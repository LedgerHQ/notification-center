import { Payload, Database } from './types';
import { getUser } from './database';
import connectors from './connectors';

export async function sendNotifications(
  payload: Payload.NotifyUser
): Promise<Database.User | null> {
  try {
    const user = await getUser(payload.to);
    if (!user) return null;
    else {
      // get all the channels of the user
      const channels = user.channels;

      // Sending notification message to the telegram handles
      if (channels.telegram?.length)
        connectors.telegram.notify(payload.message, user.channels.telegram);

      // Sending notification message to IFTTT
      if (channels.ifttt?.length)
        connectors.ifttt.notify(payload.message, user.channels.ifttt);

      return user;
    }
  } catch (err) {
    console.error('➡️ The following error ocurred : ', err);
    return null;
  }
}
