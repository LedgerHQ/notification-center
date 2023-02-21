import IFTTTConnector from './connector';
import { ConnectorError } from '../IConnector';
import axios from 'axios';

// Mock jest and set the type
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('IFTTTConnector', () => {
  describe('Internal logic', () => {
    test('returns the correct ID', async () => {
      // create a new instance of the connector
      const connector = new IFTTTConnector();

      // check the ID is correct
      expect(connector.id).toBe('IFTTTConnector');
    });

    test('throw expected error', async () => {
      // create a new instance of the connector
      const connector = new IFTTTConnector();
      const cause = 'test cause';

      try {
        connector.throwError(cause);
        // fail test if above expression doesn't throw anything.
        expect(true).toBe(false);
      } catch (error) {
        if (error instanceof ConnectorError) {
          expect(error.name).toBe('ConnectorError');
          expect(error.message).toBe(cause);
          expect(error.connectorId).toBe('IFTTTConnector');
        } else {
          // fail test if error thrown is not of type ConnectorError
          expect(true).toBe(false);
        }
      }
    });
  });

  describe('Third party interaction', () => {
    const fixtures = {
      baseUrl:
        'https://maker.ifttt.com/trigger/LEDGER_FRESH_EVENT/json/with/key/',
      targets: ['KEY-1', 'KEY-2', 'KEY-3'],
      message: 'test message',
    };

    // reset mock of axios before each test
    beforeEach(() => {
      mockedAxios.post.mockReset();
    });

    test('No requests are rejected', async () => {
      // create a new instance of the connector
      const connector = new IFTTTConnector();

      // return a valid response for all the requests
      mockedAxios.post.mockResolvedValue(
        "Congratulations! You've fired the LEDGER_FRESH_EVENT JSON event"
      );

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
          `${fixtures.baseUrl}${target}`,
          { message: fixtures.message }
        );
      });
    });

    test('Two out of three requests are rejected', async () => {
      // create a new instance of the connector
      const connector = new IFTTTConnector();

      // return a valid response for one request but reject other ones
      mockedAxios.post
        .mockResolvedValueOnce(
          "Congratulations! You've fired the LEDGER_FRESH_EVENT JSON event"
        )
        .mockRejectedValue('You sent an invalid key.');

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
          `${fixtures.baseUrl}${target}`,
          { message: fixtures.message }
        );
      });
    });

    test('All requests are rejected', async () => {
      // create a new instance of the connector
      const connector = new IFTTTConnector();

      // reject all requests to the third party
      mockedAxios.post.mockRejectedValue('You sent an invalid key.');

      // Call the notify method and check that it does throw an error
      try {
        await connector.notify(fixtures.message, fixtures.targets);
        // not expected to reach -- fail test if above expression doesn't throw anything.
        expect(true).toBe(false);
      } catch (error) {
        if (error instanceof ConnectorError) {
          expect(error.name).toBe('ConnectorError');
          expect(error.message).toBe('Impossible to reach the IFTTT service');
          expect(error.connectorId).toBe('IFTTTConnector');
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
          `${fixtures.baseUrl}${target}`,
          { message: fixtures.message }
        );
      });
    });
  });
});
