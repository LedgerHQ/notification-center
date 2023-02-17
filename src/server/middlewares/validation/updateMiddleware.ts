import { NextFunction, Response } from 'express';
import { Payload } from '../../../types';
import { TypedRequestBody, payloadError } from './utils';

const isValidPayload = (payload: Payload.UpdateUser) => {
  const acceptableTimeDelta =
    parseInt(process.env.MAX_TIME_DIFF || '', 10) || 300_00;

  // If the request was built less than MAX_ACCEPTABLE_TIME_DIFF ms ago, or if build "in the future" it is not valid.
  if (
    Date.now() < payload.timestamp ||
    Date.now() - payload.timestamp > acceptableTimeDelta
  )
    return false;

  // TODO: implement the check of the public key to be sure it is allowed by the wallet address
  // NOT POSSIBLE RIGHT NOW AS WE DO NOT HAVE THIS INFORMATION IN THE DATABASE
  // MUST REQUEST THE WATCHER MODULE TO IMPLEMENT THIS CHECK

  // TODO:: implement the verification of the signature as detailed here
  // https://github.com/LedgerHQ/ledger-fresh-management/issues/38#issue-1507778027
  return true;
};

const updateMiddleware = (
  req: TypedRequestBody<Payload.UpdateUser>,
  _: Response,
  next: NextFunction
) => {
  const isPayloadValid = isValidPayload(req.body);
  isPayloadValid ? next() : next(payloadError);
};

export default updateMiddleware;
