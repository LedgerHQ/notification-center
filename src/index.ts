import express, { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { createVerify } from 'crypto';
import * as bodyParser from "body-parser";
import { verify as verifSigner } from 'jsonwebtoken'
import { payload } from './utils/types'
import { updateUser } from './database';
import dotenv from 'dotenv';
import { telegramPlugin } from './plugins/telegram/telegramPlugin';
import { sendNotifications } from './notification';

dotenv.config();

const app = express();
const router = Router();

// Connect to a MongoDB instance
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_URL!, () => {
  console.log('Connected to database successfully')
});

const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  message: 'Too many requests, please try again later'
});

const isValidPayload = (payload: payload) => {
  const { walletAddress, values, timestamp, signature, publicKey } = payload;
  const currentTimestamp = Date.now();
  const timeDiff = currentTimestamp - timestamp;

  // // Verify signature and publicKey
  // const verify = createVerify('SHA256');
  // verify.update(`${walletAddress}${values}${timestamp}`);

  // if (!verify.verify(publicKey, signature)) {
  //   return false;
  // }

  // // Check that the publicKey is a valid signer of the walletAddress
  // try {
  //   const decoded = verifSigner(publicKey, 'test');
  //   if (decoded.walletAddress !== walletAddress) {
  //     return false;
  //   }
  // } catch (err) {
  //   return false;
  // }

  // Set a deadline for the payload
  // if (timeDiff > Number(process.env.MAX_TIME_DIFF)) {
  //   return false;
  // }


  return true;
};


app.use(express.json());

router.post('/updateNotificationPreferences', rateLimiter, (req, res) => {
  const { walletAddress, values, timestamp, signature, publicKey } = req.body;

  if (!isValidPayload({ walletAddress, values, timestamp, signature, publicKey })) {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  console.log(req.body)
  // Update the database with the new preferences
  updateUser({walletAddress, values, timestamp, signature, publicKey});
  return res.json({ message: 'Preferences updated' });
});

router.post('/sendNotifications', rateLimiter, (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  // Check the corresponding user/handles and send the notification
  try {
    sendNotifications({to, message});
  } catch (err) {
      console.log("The following error ocurred : ", err);
  }
  return res.json({ message: 'Notification sent' });
});

router.get('/ping', (req, res) => {
  return res.json({ message: 'Server is up and running' });
});

app.use('/', router);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
