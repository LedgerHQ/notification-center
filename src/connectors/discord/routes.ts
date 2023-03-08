import express from 'express';

const router = express.Router();

/*
 ** List of commands that the user can send to the bot to receive his chatid
 ** The chat_id is needed to receive future fresh notification
 */
export const DISCORD_VALID_COMMANDS = ['/start', '/fresh'];

export default router;
