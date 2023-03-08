import { Payload } from '../../types';
import { getUser } from '../../database';
import connectors from '../../connectors';

const notify = async (payload: Payload.NotifyUser) => {
  const user = await getUser(payload.to);
  if (!user) throw new Error('User not found');

  const notifications = [];

  // if the users saved some Telegram handles, push the notification order to the notifications list
  if (user.channels.telegram?.length)
    notifications.push(
      connectors.telegram.notify(payload.message, user.channels.telegram)
    );

  // if the users saved some IFTTT endpoints, push the notification order to the notifications list
  if (user.channels.ifttt?.length)
    notifications.push(
      connectors.ifttt.notify(payload.message, user.channels.ifttt)
    );

  // if the users saved some Discord endpoints, push the notification order to the notifications list
  if (user.channels.discord?.length)
    notifications.push(
      connectors.discord.notify(payload.message, user.channels.discord)
    );

  // wait for all promises to resolve and get back the results and the status of all promises
  const responses = await Promise.allSettled(notifications);

  // *OPINIONATED*: consider the communication done if at least one of the channel has been reached
  const isAllRequestsRejected = responses.every(
    (response) => response.status === 'rejected'
  );

  // if all requests have been rejected, throw an error
  if (isAllRequestsRejected)
    throw new Error("Impossible to reach any of the user's channels");
};

export default notify;
