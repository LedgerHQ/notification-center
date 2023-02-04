import express, { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { Payload } from './utils/types';
import { updateUser } from './database';
import dotenv from 'dotenv';
import { sendNotifications } from './notification';

dotenv.config();

const app = express();
const router = Router();

// Connect to a MongoDB instance
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_URL ?? '', () => {
  console.log('Connected to database successfully');
});

const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  message: 'Too many requests, please try again later',
});

// This part will be tested with a correct implementation of the watcher
const isValidPayload = (_: Payload) => {
  // const currentTimestamp = Date.now()
  // // Verify the public key
  // const digest = crypto.createHash('sha256')
  //   .update(payload.walletAddress + JSON.stringify(payload.values) + payload.timestamp)
  //   .digest('hex');
  // const recoveredPublicKey = crypto.createVerify('sha256')
  //   .update(digest)
  //   .verify(payload.publicKey, payload.signature, 'hex');
  // if (!recoveredPublicKey) {
  //   return false;
  // }

  // // Check if the public key is a valid signer of the wallet address
  // // missing

  // // Verify the timestamp difference
  // if (Math.abs(currentTimestamp - payload.timestamp) > (process.env.MAX_TIME_DIFF || 300000)) {
  //   return false;
  // }

  return true;
};

app.use(express.json());

// Create or update a user in the db
router.post('/updateNotificationPreferences', rateLimiter, (req, res) => {
  const { walletAddress, values, timestamp, signature, publicKey } = req.body;

  if (
    !isValidPayload({ walletAddress, values, timestamp, signature, publicKey })
  ) {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  // Update the database with the new preferences
  updateUser({ walletAddress, values, timestamp, signature, publicKey });
  return res.json({ message: 'Preferences updated' });
});

// Send notification to the available services
router.post('/sendNotifications', rateLimiter, (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  // Check the corresponding user/handles and send the notification
  try {
    sendNotifications({ to, message });
  } catch (err) {
    console.log('The following error ocurred : ', err);
  }
  return res.json({ message: 'Notification sent' });
});

// Check server health status
router.get('/ping', (req, res) => {
  return res.json({ message: 'Server is up and running' });
});

app.use('/', router);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
