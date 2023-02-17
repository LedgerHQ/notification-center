export interface TypedRequestBody<T> extends Express.Request {
  body: T;
}
export const payloadError = new Error('Invalid payload');
