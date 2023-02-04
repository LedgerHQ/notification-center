import axios from 'axios';

const EVENT_NAME = 'LEDGER_FRESH_EVENT';
const apiUrl = `https://maker.ifttt.com`;

async function triggerIFTTTWebhook(key: string, message: string) {
  try {
    await axios.post(`${apiUrl}/trigger/${EVENT_NAME}/json/with/key/${key}`, {
      message: message,
    });
    console.log('➡️ IFTTT webhook event sent to ' + key);
  } catch (err) {
    console.error('❌ Failed to trigger webhook for key - ', key, err);
  }
}

// Send the notification message from user chat Id
export async function iftttPlugin(message: string, keys: string[]) {
  const promises: Promise<void>[] = [];
  keys.map((key) => {
    promises.push(triggerIFTTTWebhook(key, message));
  });
  await Promise.all(promises);
}
