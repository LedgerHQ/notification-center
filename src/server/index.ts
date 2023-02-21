import express from 'express';
import mongoose from 'mongoose';
import { updateUser } from '../database';
import notify from './routes/notify';
import {
  updateMiddleware,
  notifyMiddleware,
} from './middlewares/validation/index';
// custom router and custom init logic required by the telegram connector
import { TelegramRouter, setupWebhook } from '../connectors/telegram';

const app = express();

const ROUTE = {
  update: '/updateNotificationPreferences',
  notify: '/notify',
  ping: '/ping',
  // namespace for the telegram custom routing
  telegram: '/telegram',
};

/*****************************/
/******** MIDDLEWARES ********/
/*****************************/
app.use(express.json());
app.use(ROUTE.update, updateMiddleware);
app.use(ROUTE.notify, notifyMiddleware);

/************************/
/******** ROUTES ********/
/************************/

// Create or update a user in the db -- called by the backend of the fresh web module
app.post(ROUTE.update, async (req, res) => {
  await updateUser(req.body);
  return res.json({ message: 'Preferences updated' });
});

// Send notification to the available services -- called by the watcher module
app.post(ROUTE.notify, async (req, res) => {
  await notify({ to: req.body.to, message: req.body.message });
  return res.json({ message: 'Notification sent' });
});

// Check server health status
app.get(ROUTE.ping, (_, res) =>
  res.json({ message: 'Server is up and running' })
);

// Load the telegram router in the /telegram path
app.use(ROUTE.telegram, TelegramRouter);

const server = async () => {
  try {
    // explicitly set the strictQuery option to false to avoid warning
    // this warning will be removed in the next major release of mongoose
    mongoose.set('strictQuery', false);

    // Connect to a MongoDB instance and configure the Telegram webhook
    await Promise.all([mongoose.connect(process.env.DB_URL), setupWebhook()]);

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
