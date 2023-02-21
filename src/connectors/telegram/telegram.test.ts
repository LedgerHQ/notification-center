import TelegramConnector from './index';
import { ConnectorError } from '../IConnector';
import axios from 'axios';

// Mock jest and set the type
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('TelegramConnector', () => {
  const telegramToken = '6121869659:AAGBACjMx9MM3cItEhrXDJ1ilxiqh8jVUB1';

  describe('Internal logic', () => {
    test('returns the correct ID', async () => {
      // create a new instance of the connector
      const connector = new TelegramConnector(telegramToken);

      // check the ID is correct
      expect(connector.id).toBe('TelegramConnector');
    });

    test('throw expected error', async () => {
      // create a new instance of the connector
      const connector = new TelegramConnector(telegramToken);
      const cause = 'test cause';

      try {
        connector.throwError(cause);
        // fail test if above expression doesn't throw anything.
        expect(true).toBe(false);
      } catch (error) {
        if (error instanceof ConnectorError) {
          expect(error.name).toBe('ConnectorError');
          expect(error.message).toBe(cause);
          expect(error.connectorId).toBe('TelegramConnector');
        } else {
          // fail test if error thrown is not of type ConnectorError
          expect(true).toBe(false);
        }
      }
    });
  });

  describe('Third party interaction', () => {
    const fixtures = {
      baseUrl: `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      targets: ['CHATID-1', 'CHATID-2', 'CHATID-3'],
      message: 'test message',
    };

    // reset mock of axios before each test
    beforeEach(() => {
      mockedAxios.post.mockReset();
    });

    test('No requests are rejected', async () => {
      // create a new instance of the connector
      const connector = new TelegramConnector(telegramToken);

      // return a valid response for all the requests
      mockedAxios.post.mockResolvedValue({
        result: { message: { message_id: '4664' } },
      });

      // call the notify method and check that it doesn't throw any error
      await expect(
        connector.notify(fixtures.message, fixtures.targets)
      ).resolves.not.toThrowError();

      // check that the axios post method was called the right number of times
      expect(mockedAxios.post).toHaveBeenCalledTimes(fixtures.targets.length);

      // check that the axios post method was called with the right arguments
      fixtures.targets.forEach((target, index) => {
        expect(mockedAxios.post).toHaveBeenNthCalledWith(
          index + 1,
          fixtures.baseUrl,
          { chat_id: target, text: fixtures.message }
        );
      });
    });

    test('Two out of three requests are rejected', async () => {
      // create a new instance of the connector
      const connector = new TelegramConnector(telegramToken);

      // return a valid response for one request but reject other ones
      mockedAxios.post
        .mockResolvedValueOnce({ result: { message: { message_id: '4664' } } })
        // TODO:
        .mockRejectedValue('Bad Request');

      // call the notify method and check that it doesn't throw any error
      await expect(
        connector.notify(fixtures.message, fixtures.targets)
      ).resolves.not.toThrowError();

      // check that the axios post method was called the right number of times
      expect(mockedAxios.post).toHaveBeenCalledTimes(fixtures.targets.length);

      // check that the axios post method was called with the right arguments
      fixtures.targets.forEach((target, index) => {
        expect(mockedAxios.post).toHaveBeenNthCalledWith(
          index + 1,
          fixtures.baseUrl,
          { chat_id: target, text: fixtures.message }
        );
      });
    });

    test('All requests are rejected', async () => {
      // create a new instance of the connector
      const connector = new TelegramConnector(telegramToken);

      // reject all requests to the third party
      mockedAxios.post.mockRejectedValue('Bad Request');

      // Call the notify method and check that it does throw an error
      try {
        await connector.notify(fixtures.message, fixtures.targets);
        // not expected to reach -- fail test if above expression doesn't throw anything.
        expect(true).toBe(false);
      } catch (error) {
        if (error instanceof ConnectorError) {
          expect(error.name).toBe('ConnectorError');
          expect(error.message).toBe(
            'Impossible to reach the Telegram service'
          );
          expect(error.connectorId).toBe('TelegramConnector');
        } else {
          // not expected to reach -- fail test if error thrown is not of type ConnectorError
          expect(true).toBe(false);
        }
      }

      // check that the axios post method was called the right number of times
      expect(mockedAxios.post).toHaveBeenCalledTimes(fixtures.targets.length);

      // check that the axios post method was called with the right arguments
      fixtures.targets.forEach((target, index) => {
        expect(mockedAxios.post).toHaveBeenNthCalledWith(
          index + 1,
          fixtures.baseUrl,
          { chat_id: target, text: fixtures.message }
        );
      });
    });
  });
});
