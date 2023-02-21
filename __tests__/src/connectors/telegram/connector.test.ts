import TelegramConnector from '../../../../src/connectors/telegram/connector';
import { ConnectorError } from '../../../../src/connectors/IConnector';
import { sendMessage } from '../../../../src/connectors/telegram/utils';
import { AxiosResponse } from 'axios';

// Mock jest and set the type
jest.mock('../../../../src/connectors/telegram/utils');
const mockedSendMessage = jest.mocked(sendMessage);

describe('TelegramConnector', () => {
  describe('Internal logic', () => {
    test('returns the correct ID', async () => {
      // create a new instance of the connector
      const connector = new TelegramConnector();

      // check the ID is correct
      expect(connector.id).toBe('TelegramConnector');
    });

    test('throw expected error', async () => {
      // create a new instance of the connector
      const connector = new TelegramConnector();
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
      targets: ['CHATID-1', 'CHATID-2', 'CHATID-3'],
      message: 'test message',
    };

    beforeEach(() => {
      mockedSendMessage.mockReset();
    });

    test('No requests are rejected', async () => {
      // create a new instance of the connector
      const connector = new TelegramConnector();

      // return a valid response for all the requests
      mockedSendMessage.mockResolvedValue({
        status: 200,
        statusText: 'OK',
      } as AxiosResponse);

      // call the notify method and check that it doesn't throw any error
      await expect(
        connector.notify(fixtures.message, fixtures.targets)
      ).resolves.not.toThrowError();

      // check that the axios post method was called the right number of times
      expect(mockedSendMessage).toHaveBeenCalledTimes(fixtures.targets.length);

      // check that the axios post method was called with the right arguments
      fixtures.targets.forEach((target, index) => {
        expect(mockedSendMessage).toHaveBeenNthCalledWith(
          index + 1,
          target,
          fixtures.message
        );
      });
    });

    test('Two out of three requests are rejected', async () => {
      // create a new instance of the connector
      const connector = new TelegramConnector();

      // return a valid response for one request but reject other ones
      mockedSendMessage
        .mockResolvedValueOnce({
          status: 200,
          statusText: 'OK',
        } as AxiosResponse)
        // TODO:
        .mockRejectedValue({
          status: 500,
          statusText: 'ERROR',
        } as AxiosResponse);

      // call the notify method and check that it doesn't throw any error
      await expect(
        connector.notify(fixtures.message, fixtures.targets)
      ).resolves.not.toThrowError();

      // check that the axios post method was called the right number of times
      expect(mockedSendMessage).toHaveBeenCalledTimes(fixtures.targets.length);

      // check that the axios post method was called with the right arguments
      fixtures.targets.forEach((target, index) => {
        expect(mockedSendMessage).toHaveBeenNthCalledWith(
          index + 1,
          target,
          fixtures.message
        );
      });
    });

    test('All requests are rejected', async () => {
      // create a new instance of the connector
      const connector = new TelegramConnector();

      // reject all requests to the third party
      mockedSendMessage.mockRejectedValue({
        status: 401,
        statusText: 'ERROR',
      } as AxiosResponse);

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
      expect(mockedSendMessage).toHaveBeenCalledTimes(fixtures.targets.length);

      // check that the axios post method was called with the right arguments
      fixtures.targets.forEach((target, index) => {
        expect(mockedSendMessage).toHaveBeenNthCalledWith(
          index + 1,
          target,
          fixtures.message
        );
      });
    });
  });
});
