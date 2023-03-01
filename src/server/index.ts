import express from 'express';
import mongoose from 'mongoose';
import notify from './routes/notify';
import update from './routes/update';
import {
  updateMiddleware,
  notifyMiddleware,
} from './middlewares/validation/index';
// custom router and custom init logic required by the telegram connector
import { TelegramRouter, setupWebhook } from '../connectors/telegram';
import { DB_URL } from '../database/config';

const { NODE_DOCKER_PORT, USE_DOCKER, LOCAL_PORT } = process.env;

export const app = express();

export const ROUTE = {
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
  try {
    await update(req.body);
    return res.json({ message: 'Preferences updated' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send('Internal error');
    }
  }
});

// Send notification to the available services -- called by the watcher module
app.post(ROUTE.notify, async (req, res) => {
  try {
    await notify({ to: req.body.to, message: req.body.message });
    res.json({ message: 'Notification sent' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send('Internal error');
    }
  }
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
    await Promise.all([mongoose.connect(DB_URL), setupWebhook()]);

    // Start the server
    const PORT = USE_DOCKER ? NODE_DOCKER_PORT : LOCAL_PORT;
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default server;
