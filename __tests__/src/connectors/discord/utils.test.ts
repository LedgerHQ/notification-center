import axios from 'axios';
import {
  sendMessage,
  getDiscordSendMessageUrl,
} from '@/src/connectors/discord/utils';

// Mock jest and set the type
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('sendMessage', () => {
  const fixtures = {
    chatId: 'CHATID-1',
    message: 'test message',
  };

  beforeEach(() => {
    mockedAxios.create.mockReturnThis();
    mockedAxios.post.mockReset();
  });

  test('message is sent as expected', async () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    // return a valid response for all the requests
    mockedAxios.post.mockResolvedValueOnce({
      status: 200,
      statusText: 'OK',
    });

    // send a message and check the function doesn't throw any error
    await expect(
      sendMessage(fixtures.chatId, fixtures.message)
    ).resolves.not.toThrowError();

    // make sure console.error was not called
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining(getDiscordSendMessageUrl(fixtures.chatId)),
      { content: fixtures.message }
    );

    // restore the console.error spyOn
    consoleErrorMock.mockRestore();
  });

  test("message isn't sent correctly", async () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    // return a valid response for all the requests
    mockedAxios.post.mockResolvedValueOnce({
      status: 401,
      statusText: 'ERROR',
    });

    // call the function and check that it throws the correct error
    try {
      await sendMessage(fixtures.chatId, fixtures.message);
      // not expected to reach -- fail test if above expression doesn't throw anything.
      expect(true).toBe(false);
    } catch (error) {
      if (error instanceof Error) {
        // make sure the abstracted error is returned by the function, not the real one
        expect(error.message).toEqual(`${401}: ERROR`);
      } else {
        // not expected to reach -- fail test if error thrown is not of type ConnectorError
        expect(true).toBe(false);
      }
    }

    // make sure console.error was not called
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining(getDiscordSendMessageUrl(fixtures.chatId)),
      { content: fixtures.message }
    );

    // restore the console.error spyOn
    consoleErrorMock.mockRestore();
  });
});
