import express from 'express';
import { sendMessage } from './utils';

const router = express.Router();
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

/*
 ** List of commands that the user can send to the bot to receive his chatid
 ** The chat_id is needed to receive future fresh notification
 ** There is no way user-side to get the chat_id without interacting with our Telegram bot
 ** `/start` is the default command sent by Telegram when a user start a discussion with a bot
 ** `/fresh` is a command that can be sent by the user to receive his chatid. It is listed in the command list.
 */
const commands = ['/start', '/fresh'];

/*
 ** This route is used to receive all updates received by the Telegram bot.
 ** This route receives all messages sent by Telegram users and all status updates
 ** (someone start the discussion, end the discussion...), but only reacts to specific
 ** commands.
 */
router.post(`/webhook/:telegramToken`, async (req, res) => {
  // only authorized parties who know our private telegram token
  if (req.params.telegramToken !== TELEGRAM_TOKEN)
    return res.status(401).send('Unauthorized');

  // only react to specific messages sent by the user (not status updates)
  if (req.body.message === undefined) return res.status(200).send('OK');
  if (!commands.includes(req.body.message.text))
    return res.status(200).send('OK');

  // respond to the user with the chatid needed to receive future fresh notification
  const {
    message: {
      chat: { id },
    },
  } = req.body;
  const response = await sendMessage(id, `Your chatid is ${id}`);

  res.status(response.status).send(response.statusText);
});

export default router;
