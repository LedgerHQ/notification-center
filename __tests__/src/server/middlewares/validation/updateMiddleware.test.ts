import { Response } from 'express';
import updateMiddleware from '../../../../../src/server/middlewares/validation/updateMiddleware';
import {
  TypedRequestBody,
  payloadError,
} from '../../../../../src/server/middlewares/validation/utils';
import { Payload } from '../../../../../src/types';

// TODO: rename + paylaodErrorcheck

describe('Middleware -- updateMiddleware', () => {
  describe('check timestamp validation', () => {
    const bodyFixture = {
      walletAddress: '',
      values: { telegram: [], ifttt: [] },
      signature: '',
      publicKey: '',
    };
    const env = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...env };
    });

    afterEach(() => {
      // reset timer mocking
      jest.useRealTimers();

      // reset env mocking
      process.env = env;
    });

    test('payload is directly sent to the server', async () => {
      const request = {
        body: {
          timestamp: Date.now(),
          ...bodyFixture,
        },
      } satisfies TypedRequestBody<Payload.UpdateUser>;

      const res = {} as Response;
      const next = jest.fn();

      updateMiddleware(request, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).not.toHaveBeenCalledWith(payloadError);
    });

    test('payload is sent to the server 1ms before the time limit', async () => {
      const now = Date.now();

      // mock date.now() to return a specific date
      jest.useFakeTimers();
      // freeze the server date to the current one
      jest.setSystemTime(now);

      const request = {
        body: {
          // set the timestamp to 1ms before the time limit
          // as if the request was prepared TIME_LIMIT - 1ms ago
          timestamp: now - 1,
          ...bodyFixture,
        },
      } satisfies TypedRequestBody<Payload.UpdateUser>;

      const res = {} as Response;
      const next = jest.fn();

      updateMiddleware(request, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).not.toHaveBeenCalledWith(payloadError);
    });

    test('payload is sent to the server on the time limit', async () => {
      const now = Date.now();

      // mock date.now() to return a specific date
      jest.useFakeTimers();
      // freeze the server date to the current one
      jest.setSystemTime(now);

      const request = {
        body: {
          // set the timestamp to the time limit
          timestamp: now,
          ...bodyFixture,
        },
      } satisfies TypedRequestBody<Payload.UpdateUser>;

      const res = {} as Response;
      const next = jest.fn();

      updateMiddleware(request, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).not.toHaveBeenCalledWith(payloadError);
    });

    test('payload is sent to the server 1ms after the time limit', async () => {
      const now = Date.now();

      // mock date.now() to return a specific date
      jest.useFakeTimers();
      // freeze the server date to the current one
      jest.setSystemTime(now);

      const request = {
        body: {
          // set the timestamp to 1ms after the time limit
          // as if the request was prepared TIME_LIMIT + 1ms ago
          timestamp: now + 1,
          ...bodyFixture,
        },
      } satisfies TypedRequestBody<Payload.UpdateUser>;

      const res = {} as Response;
      const next = jest.fn();

      updateMiddleware(request, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(payloadError);
    });

    test('payload is verified against environment variable time limit', async () => {
      // this is the default value hardcoded in the middleware
      const defaultMaxTimeDiff = 300_000; // 300_000ms = 300s = 5min
      // set the environment variable to a higher value
      process.env.MAX_TIME_DIFF = '500000'; // 500_000ms = 500s = 8.33min

      // save current time
      const now = Date.now();
      // mock date.now() to return a specific date
      jest.useFakeTimers();
      // freeze the server date to the current one
      jest.setSystemTime(now);

      const request = {
        body: {
          // set the timestamp to 1ms after the default time limit
          // as if the request was prepared DEFAULT_TIME_LIMIT + 1ms ago
          // this test is expected to fail if the envionment variable is not used
          // but as we set the environment variable to a higher value, it should pass
          timestamp: now - defaultMaxTimeDiff - 1,
          ...bodyFixture,
        },
      } satisfies TypedRequestBody<Payload.UpdateUser>;

      const res = {} as Response;
      const next = jest.fn();

      updateMiddleware(request, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).not.toHaveBeenCalledWith(payloadError);
    });
  });
});
