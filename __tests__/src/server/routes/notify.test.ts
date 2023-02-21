import notify from '@/src/server/routes/notify';
import * as database from '@/src/database';
import connectors from '@/src/connectors';

// Mock the database module
jest.mock('@/src/database');
const mockedDB = jest.mocked(database);

// Mock the connectors module and set the correct types
jest.mock('@/src/connectors');
const mockedIFTTT = jest.mocked(connectors.ifttt);
const mockedTelegram = jest.mocked(connectors.telegram);

describe('notify', () => {
  // ******* FIXTURES *******
  const payload = {
    to: '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d',
    message: 'test message',
  };
  const channels = { telegram: ['fake-telegram'], ifttt: ['fake-ifttt'] };
  const user = { id: 'toto', channels };

  // reset mocks before each test
  beforeEach(() => {
    mockedDB.getUser.mockReset();
    mockedIFTTT.notify.mockReset();
    mockedTelegram.notify.mockReset();
  });

  test('send notifications to all channels when available', async () => {
    mockedDB.getUser.mockResolvedValueOnce(user);

    // call the function and check that it doesn't throw any error
    await expect(notify(payload)).resolves.not.toThrowError();

    // check that the database.getUser method has been called with the correct parameters
    expect(mockedDB.getUser).toHaveBeenCalledTimes(1);
    expect(mockedDB.getUser).toHaveBeenCalledWith(payload.to);
    await expect(mockedDB.getUser.mock.results[0].value).resolves.toStrictEqual(
      user
    );

    // check that the Telegram connector has been called with the correct parameters
    expect(mockedTelegram.notify).toHaveBeenCalledTimes(1);
    expect(mockedTelegram.notify).toHaveBeenCalledWith(
      payload.message,
      channels.telegram
    );

    // check that the IFTTT connector has been called with the correct parameters
    expect(mockedIFTTT.notify).toHaveBeenCalledTimes(1);
    expect(mockedIFTTT.notify).toHaveBeenCalledWith(
      payload.message,
      channels.ifttt
    );
  });

  test('send notification only to IFTTT', async () => {
    const customUser = { ...user, channels: { ...channels, telegram: [] } };

    mockedDB.getUser.mockResolvedValueOnce(customUser);

    await expect(notify(payload)).resolves.not.toThrowError();

    expect(mockedDB.getUser).toHaveBeenCalledTimes(1);
    expect(mockedDB.getUser).toHaveBeenCalledWith(payload.to);
    await expect(mockedDB.getUser.mock.results[0].value).resolves.toStrictEqual(
      customUser
    );

    // check that the Telegram connector has not been called as it is not in the user channels
    expect(mockedTelegram.notify).toHaveBeenCalledTimes(0);

    expect(mockedIFTTT.notify).toHaveBeenCalledTimes(1);
    expect(mockedIFTTT.notify).toHaveBeenCalledWith(
      payload.message,
      channels.ifttt
    );
  });

  test('send notification only to Telegram', async () => {
    const customUser = { ...user, channels: { ...channels, ifttt: [] } };

    mockedDB.getUser.mockResolvedValueOnce(customUser);

    await expect(notify(payload)).resolves.not.toThrowError();

    expect(mockedDB.getUser).toHaveBeenCalledTimes(1);
    expect(mockedDB.getUser).toHaveBeenCalledWith(payload.to);
    await expect(mockedDB.getUser.mock.results[0].value).resolves.toStrictEqual(
      customUser
    );

    expect(mockedTelegram.notify).toHaveBeenCalledTimes(1);
    expect(mockedTelegram.notify).toHaveBeenCalledWith(
      payload.message,
      channels.telegram
    );

    // check that the IFTTT connector has not been called as it is not in the user channels
    expect(mockedIFTTT.notify).toHaveBeenCalledTimes(0);
  });

  test("throws an error if the user doesn't exist", async () => {
    mockedDB.getUser.mockResolvedValueOnce(null);

    // call the function and check that it throws the correct error
    // the function is expected to fail because the user doesn't exist
    try {
      await notify(payload);
      // not expected to reach -- fail test if above expression doesn't throw anything.
      expect(true).toBe(false);
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toBe('User not found');
      } else {
        // not expected to reach -- fail test if error thrown is not of type ConnectorError
        expect(true).toBe(false);
      }
    }

    expect(mockedDB.getUser).toHaveBeenCalledTimes(1);
    expect(mockedDB.getUser).toHaveBeenCalledWith(payload.to);

    // check that connectors have not been called as the user doesn't exist
    expect(mockedTelegram.notify).toHaveBeenCalledTimes(0);
    expect(mockedIFTTT.notify).toHaveBeenCalledTimes(0);
  });

  test("doesn't throw any error if only 1 on 2 channels fail (IFTTT)", async () => {
    const errorMessage = 'Impossible to reach the IFTTT service';

    mockedDB.getUser.mockResolvedValueOnce(user);
    // mock the IFTTT connector to throw an error
    mockedIFTTT.notify.mockRejectedValue(errorMessage);

    await expect(notify(payload)).resolves.not.toThrowError();

    expect(mockedDB.getUser).toHaveBeenCalledTimes(1);
    expect(mockedDB.getUser).toHaveBeenCalledWith(payload.to);
    await expect(mockedDB.getUser.mock.results[0].value).resolves.toStrictEqual(
      user
    );

    expect(mockedTelegram.notify).toHaveBeenCalledTimes(1);
    expect(mockedTelegram.notify).toHaveBeenCalledWith(
      payload.message,
      channels.telegram
    );

    // check that the IFTTT connector has been called with the correct parameters
    // and that it has thrown the correct error
    expect(mockedIFTTT.notify).toHaveBeenCalledTimes(1);
    expect(mockedIFTTT.notify).toHaveBeenCalledWith(
      payload.message,
      channels.ifttt
    );
    await expect(mockedIFTTT.notify.mock.results[0].value).rejects.toEqual(
      errorMessage
    );
  });

  test("doesn't throw any error if only 1 on 2 channels fail (Telegram)", async () => {
    const errorMessage = 'Impossible to reach the Telegram service';

    mockedDB.getUser.mockResolvedValueOnce(user);
    // mock the Telegram connector to throw an error
    mockedTelegram.notify.mockRejectedValue(errorMessage);

    await expect(notify(payload)).resolves.not.toThrowError();

    expect(mockedDB.getUser).toHaveBeenCalledTimes(1);
    expect(mockedDB.getUser).toHaveBeenCalledWith(payload.to);
    await expect(mockedDB.getUser.mock.results[0].value).resolves.toStrictEqual(
      user
    );

    // check that the IFTTT connector has been called with the correct parameters
    // and that it has thrown the correct error
    expect(mockedTelegram.notify).toHaveBeenCalledTimes(1);
    expect(mockedTelegram.notify).toHaveBeenCalledWith(
      payload.message,
      channels.telegram
    );
    await expect(mockedTelegram.notify.mock.results[0].value).rejects.toEqual(
      errorMessage
    );

    expect(mockedIFTTT.notify).toHaveBeenCalledTimes(1);
    expect(mockedIFTTT.notify).toHaveBeenCalledWith(
      payload.message,
      channels.ifttt
    );
  });

  test('throws an error if all channel requests are rejected', async () => {
    const errorMessage = (service: TemplateStringsArray) =>
      `Impossible to reach the ${service} service`;

    // mock all connectors to throw an error
    mockedDB.getUser.mockResolvedValueOnce(user);
    mockedTelegram.notify.mockRejectedValue(errorMessage`Telegram`);
    mockedIFTTT.notify.mockRejectedValue(errorMessage`IFTTT`);

    // call the function and check that it throws the correct error
    // the function is expected to fail because all connectors have thrown an error
    try {
      await notify(payload);
      // not expected to reach -- fail test if above expression doesn't throw anything.
      expect(true).toBe(false);
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toBe(
          "Impossible to reach any of the user's channels"
        );
      } else {
        // not expected to reach -- fail test if error thrown is not of type ConnectorError
        expect(true).toBe(false);
      }
    }

    expect(mockedDB.getUser).toHaveBeenCalledTimes(1);
    expect(mockedDB.getUser).toHaveBeenCalledWith(payload.to);
    await expect(mockedDB.getUser.mock.results[0].value).resolves.toStrictEqual(
      user
    );

    expect(mockedTelegram.notify).toHaveBeenCalledTimes(1);
    expect(mockedTelegram.notify).toHaveBeenCalledWith(
      payload.message,
      channels.telegram
    );
    await expect(mockedTelegram.notify.mock.results[0].value).rejects.toEqual(
      errorMessage`Telegram`
    );

    expect(mockedIFTTT.notify).toHaveBeenCalledTimes(1);
    expect(mockedIFTTT.notify).toHaveBeenCalledWith(
      payload.message,
      channels.ifttt
    );
    await expect(mockedIFTTT.notify.mock.results[0].value).rejects.toEqual(
      errorMessage`IFTTT`
    );
  });
});
