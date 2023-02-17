import express from 'express';

import mongoose from 'mongoose';
import { Payload } from '../types';
import { updateUser } from '../database';
import { sendNotifications } from '../notification';

const app = express();

// TODO: middleware to verify the payload
// This part will be tested with a correct implementation of the watcher
const isValidPayload = (_: Payload.UpdateUser) => {
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

// Create or update a user in the db -- called by the backend of the fresh web module
app.post('/updateNotificationPreferences', (req, res) => {
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

// Send notification to the available services -- called by the watcher module
app.post('/sendNotifications', (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  // Check the corresponding user/handles and send the notification
  try {
    sendNotifications({ to, message });
  } catch (err) {
    console.error('The following error ocurred : ', err);
  }
  return res.json({ message: 'Notification sent' });
});

// Check server health status
app.get('/ping', (_, res) => {
  return res.json({ message: 'Server is up and running' });
});

const server = async () => {
  try {
    mongoose.set('strictQuery', true);

    // Connect to a MongoDB instance
    // TODO: remove casting
    await mongoose.connect(process.env.DB_URL as string);

    // Start the server
    app.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default server;
