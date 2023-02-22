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

    const res = { status: jest.fn() } as unknown as Response;
    const next = jest.fn();

    notifyMiddleware(request, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalledWith(payloadError);
  });

  test('calls the callback function with an error if to is missing', async () => {
    const request: TypedRequestBody<Payload.NotifyUser> = {
      body: {
        to: '',
        message: 'Hello you!',
      },
    };

    // mock the status and the send field. References are saved
    // in order to be able to test them at the end of the test
    const resStatus = jest.fn();
    const resSend = jest.fn();
    resStatus.mockReturnValueOnce({ send: resSend });
    const res = { status: resStatus } as unknown as Response;

    const next = jest.fn();

    notifyMiddleware(request, res, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(resStatus).toHaveBeenCalledWith(400);
    expect(resSend).toHaveBeenCalledWith(payloadError.message);
  });

  test('calls the callback function with an error if message is missing', async () => {
    const request: TypedRequestBody<Payload.NotifyUser> = {
      body: {
        to: '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d',
        message: '',
      },
    };

    // mock the status and the send field. References are saved
    // in order to be able to test them at the end of the test
    const resStatus = jest.fn();
    const resSend = jest.fn();
    resStatus.mockReturnValueOnce({ send: resSend });
    const res = { status: resStatus } as unknown as Response;

    const next = jest.fn();

    notifyMiddleware(request, res, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(resStatus).toHaveBeenCalledWith(400);
    expect(resSend).toHaveBeenCalledWith(payloadError.message);
  });
});
