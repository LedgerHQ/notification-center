import { Response } from 'express';
import notifyMiddleware from '@/src/server/middlewares/validation/notifyMiddleware';
import {
  TypedRequestBody,
  payloadError,
} from '@/src/server/middlewares/validation/utils';
import { Payload } from '@/src/types';

describe('Middleware -- notifyMiddleware', () => {
  test('calls the callback function if params are here', async () => {
    const request: TypedRequestBody<Payload.NotifyUser> = {
      body: {
        to: '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d',
        message: 'Hello you!',
      },
    };

    const res = {} as Response;
    const next = jest.fn();

    notifyMiddleware(request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalledWith(payloadError);
  });

  test('calls the callback function with an error if to is missing', async () => {
    const request: TypedRequestBody<Payload.NotifyUser> = {
      body: {
        to: '',
        message: 'Hello you!',
      },
    };

    const res = {} as Response;
    const next = jest.fn();

    notifyMiddleware(request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(payloadError);
  });

  test('calls the callback function with an error if message is missing', async () => {
    const request: TypedRequestBody<Payload.NotifyUser> = {
      body: {
        to: '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d',
        message: '',
      },
    };

    const res = {} as Response;
    const next = jest.fn();

    notifyMiddleware(request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(payloadError);
  });
});
