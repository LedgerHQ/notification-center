import { app, ROUTE } from '@/src/server';
import supertest from 'supertest';
import notify from '@/src/server/routes/notify';
import update from '@/src/server/routes/update';
import type { Payload } from '@/src/types';
import { payloadError } from '@/src/server/middlewares/validation/utils';
import * as TelegramUtils from '@/src/connectors/telegram/utils';
import { TELEGRAM_VALID_COMMANDS } from '@/src/connectors/telegram/routes';
import { AxiosResponse } from 'axios';

// Mock the notify route and set the type
jest.mock('@/src/server/routes/notify');
const mockedNotifyRoute = jest.mocked(notify);

// Mock the update route and set the type
jest.mock('@/src/server/routes/update');
const mockedUpdateRoute = jest.mocked(update);

// Mock the telegram sendMessage util function and set the type
jest.mock('@/src/connectors/telegram/utils');
const mockedSendMessage = jest.mocked(TelegramUtils.sendMessage);

describe('server', () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(() => {
    request = supertest(app);
  });

  test(ROUTE.ping, async () => {
    const response = await request
      .get(ROUTE.ping)
      .set('Accept', 'application/json');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.message).toEqual('Server is up and running');
  });

  describe(ROUTE.notify, () => {
    beforeEach(() => {
      mockedNotifyRoute.mockReset();
    });

    test('success', async () => {
      const params = {
        to: '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d',
        message: 'hello test',
      };

      const response = await request
        .post(ROUTE.notify)
        .send(params)
        .set('Accept', 'application/json');

      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual('Notification sent');

      expect(mockedNotifyRoute).toHaveBeenCalledTimes(1);
      expect(mockedNotifyRoute).toHaveBeenCalledWith(params);
    });

    test('incorrect payload verification', async () => {
      const incorrectParams = [{ message: 'test' }, { to: '0x' }, {}];

      for (const param of incorrectParams) {
        const response = await request
          .post(ROUTE.notify)
          .send(param)
          .set('Accept', 'application/json');

        expect(response.status).toEqual(400);
        expect(response.statusCode).toEqual(400);
        expect(response.text).toBe(payloadError.message);
        // ensure this is true as the middleware returns HTTP code 400
        expect(response.badRequest).toBeTruthy();
        expect(response.unauthorized).toBeFalsy();
        expect(response.notAcceptable).toBeFalsy();
        expect(response.forbidden).toBeFalsy();
        expect(response.notFound).toBeFalsy();
        expect(response.type).toBe('text/html');

        expect(mockedNotifyRoute).toHaveBeenCalledTimes(0);
      }
    });

    test('failed', async () => {
      const params = {
        to: '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d',
        message: 'hello test',
      };
      const error = new Error("Impossible to reach any of the user's channels");

      // Mock the notify function to throw an error
      mockedNotifyRoute.mockRejectedValueOnce(error);

      const response = await request
        .post(ROUTE.notify)
        .send(params)
        .set('Accept', 'application/json');

      expect(response.status).toEqual(500);
      expect(response.statusCode).toEqual(500);
      expect(response.text).toBe(error.message);
      expect(response.badRequest).toBeFalsy();
      expect(response.unauthorized).toBeFalsy();
      expect(response.notAcceptable).toBeFalsy();
      expect(response.forbidden).toBeFalsy();
      expect(response.notFound).toBeFalsy();
      expect(response.type).toBe('text/html');

      // ensure the notify route has been called correctly
      expect(mockedNotifyRoute).toHaveBeenCalledTimes(1);
      expect(mockedNotifyRoute).toHaveBeenCalledWith(params);
    });
  });

  describe(ROUTE.update, () => {
    beforeEach(() => {
      mockedUpdateRoute.mockReset();
    });

    test('success', async () => {
      const params: Payload.UpdateUser = {
        walletAddress: '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d',
        values: { telegram: ['@test'], ifttt: ['test'] },
        timestamp: Date.now(),
        signature:
          '0x21fbf0696d5e0aa2ef41a2b4ffb623bcaf070461d61cf7251c74161f82fec3a4370854bc0a34b3ab487c1bc021cd318c734c51ae29374f2beb0e6f2dd49b4bf41c',
        publicKey:
          'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036415f',
      };

      const response = await request
        .post(ROUTE.update)
        .send(params)
        .set('Accept', 'application/json');

      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual('Preferences updated');

      expect(mockedUpdateRoute).toHaveBeenCalledTimes(1);
      expect(mockedUpdateRoute).toHaveBeenCalledWith(params);
    });

    xtest('incorrect payload verification', async () => {
      // TODO:
    });

    test('failed', async () => {
      const params: Payload.UpdateUser = {
        walletAddress: '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d',
        values: { telegram: ['@test'], ifttt: ['test'] },
        timestamp: Date.now(),
        signature:
          '0x21fbf0696d5e0aa2ef41a2b4ffb623bcaf070461d61cf7251c74161f82fec3a4370854bc0a34b3ab487c1bc021cd318c734c51ae29374f2beb0e6f2dd49b4bf41c',
        publicKey:
          'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036415f',
      };

      // Mock the notify function to throw an error
      mockedUpdateRoute.mockRejectedValueOnce(payloadError);

      const response = await request
        .post(ROUTE.update)
        .send(params)
        .set('Accept', 'application/json');

      expect(response.status).toEqual(500);
      expect(response.statusCode).toEqual(500);
      expect(response.text).toBe(payloadError.message);
      expect(response.badRequest).toBeFalsy();
      expect(response.unauthorized).toBeFalsy();
      expect(response.notAcceptable).toBeFalsy();
      expect(response.forbidden).toBeFalsy();
      expect(response.notFound).toBeFalsy();
      expect(response.type).toBe('text/html');

      // ensure the notify route has been called correctly
      expect(mockedUpdateRoute).toHaveBeenCalledTimes(1);
      expect(mockedUpdateRoute).toHaveBeenCalledWith(params);
    });
  });

  describe(ROUTE.telegram, () => {
    const OLD_ENV = process.env;
    const VALID_ROUTE = `${ROUTE.telegram}/webhook/`;

    beforeEach(() => {
      mockedSendMessage.mockReset();

      // clears the cache
      jest.resetModules();
      // make a copy
      process.env = { ...OLD_ENV };
    });

    afterEach(() => {
      // restore old environment
      process.env = OLD_ENV;
    });

    // auto-generate one test for each valid command defined in the source file
    for (const command of TELEGRAM_VALID_COMMANDS) {
      test(`success -- ${command} command`, async () => {
        // manually set the TELEGRAM_TOKEN environment variable
        process.env.TELEGRAM_TOKEN = 'TEST_TELEGRAM_TOKEN';

        const mockedReturnValue = {
          status: 200,
          // done is used here as a valid statusText in order to
          // differentiate the valid workflow from the workflow
          // not valid for our use case but valid in the PoV of Telegram API.
          // indeed, Telegram API expects us to return "OK" each time we receive
          // a request from him, meaning we return "OK" on message not valid for our
          // workflow (e.g TELEGRAM_VALID_COMMANDS)
          statusText: 'DONE',
        } as AxiosResponse;
        mockedSendMessage.mockResolvedValueOnce(mockedReturnValue);

        const params = {
          message: {
            text: command,
            chat: { id: 5 },
          },
        };

        const response = await request
          .post(`${VALID_ROUTE}${process.env.TELEGRAM_TOKEN}`)
          .send(params)
          .set('Accept', 'application/json');

        expect(response.headers['content-type']).toMatch(/text\/html/);
        expect(response.status).toEqual(mockedReturnValue.status);
        expect(response.text).toEqual(mockedReturnValue.statusText);

        const id = params.message.chat.id;
        expect(mockedSendMessage).toHaveBeenCalledTimes(1);
        expect(mockedSendMessage).toHaveBeenCalledWith(
          id,
          `Your chatid is ${id}`
        );
      });
    }

    test('success -- invalid command', async () => {
      process.env.TELEGRAM_TOKEN = 'TEST_TELEGRAM_TOKEN';

      const params = {
        message: {
          text: 'invalid',
          chat: { id: 5 },
        },
      };

      const response = await request
        .post(`${VALID_ROUTE}${process.env.TELEGRAM_TOKEN}`)
        .send(params)
        .set('Accept', 'application/json');

      expect(response.headers['content-type']).toMatch(/text\/html/);
      expect(response.status).toEqual(200);
      expect(response.text).toEqual('OK');

      // expected to return early without calling the sendMessage function
      expect(mockedSendMessage).toHaveBeenCalledTimes(0);
    });

    test('success -- not relevant update from Telegram', async () => {
      const response = await request
        .post(`${VALID_ROUTE}${process.env.TELEGRAM_TOKEN}`)
        // the abscence of the message field is what makes this request return early
        .send({})
        .set('Accept', 'application/json');

      expect(response.headers['content-type']).toMatch(/text\/html/);
      expect(response.status).toEqual(401);
      expect(response.text).toEqual('Unauthorized');

      // expected to return early without calling the sendMessage function
      expect(mockedSendMessage).toHaveBeenCalledTimes(0);
    });

    test('failed -- unauthorized party', async () => {
      process.env.TELEGRAM_TOKEN = 'TEST_TELEGRAM_TOKEN';

      const params = {
        message: {
          text: 'invalid',
          chat: { id: 5 },
        },
      };

      const response = await request
        .post(`${VALID_ROUTE}INCORRECT_TELEGRAM_TOKEN`)
        .send(params)
        .set('Accept', 'application/json');

      expect(response.headers['content-type']).toMatch(/text\/html/);
      expect(response.status).toEqual(401);
      expect(response.text).toEqual('Unauthorized');

      // expected to return early without calling the sendMessage function
      expect(mockedSendMessage).toHaveBeenCalledTimes(0);
    });

    test('failed -- response not sent', async () => {
      process.env.TELEGRAM_TOKEN = 'TEST_TELEGRAM_TOKEN';

      const mockedReturnValue = {
        status: 500,
        statusText: 'Internal error',
      } as AxiosResponse;
      mockedSendMessage.mockRejectedValueOnce(mockedReturnValue);

      const params = {
        message: {
          text: TELEGRAM_VALID_COMMANDS[0],
          chat: { id: 5 },
        },
      };

      const response = await request
        .post(`${VALID_ROUTE}${process.env.TELEGRAM_TOKEN}`)
        .send(params)
        .set('Accept', 'application/json');

      expect(response.headers['content-type']).toMatch(/text\/html/);
      expect(response.status).toEqual(mockedReturnValue.status);
      expect(response.text).toEqual(mockedReturnValue.statusText);

      const id = params.message.chat.id;
      expect(mockedSendMessage).toHaveBeenCalledTimes(1);
      expect(mockedSendMessage).toHaveBeenCalledWith(
        id,
        `Your chatid is ${id}`
      );
    });
  });
});
