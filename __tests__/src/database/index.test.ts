import { getUser, updateUser, DatabaseError } from '../../../src/database';
import * as DBModel from '../../../src/database/model';
import { Payload } from '../../../src/types';

// Mock the database module
jest.mock('../../../src/database/model');
const mockedFindByID = jest.mocked(DBModel.Users.findById);
const mockedFindOneAndUpdate = jest.mocked(DBModel.Users.findOneAndUpdate);

describe('DB: getUser', () => {
  // reset mocks before each test
  beforeEach(() => {
    mockedFindByID.mockReset();
  });

  test('should return the user if it exists', async () => {
    const address = '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d';
    const user = { id: address };

    mockedFindByID.mockResolvedValueOnce(user);

    await expect(getUser(address)).resolves.toStrictEqual(user);

    expect(mockedFindByID).toHaveBeenCalledTimes(1);
    expect(mockedFindByID).toHaveBeenCalledWith(address);
    await expect(mockedFindByID.mock.results[0].value).resolves.toStrictEqual(
      user
    );
  });

  test("should return null if the user doesn't exist", async () => {
    const address = '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d';

    mockedFindByID.mockResolvedValueOnce(null);

    await expect(getUser(address)).resolves.toStrictEqual(null);

    expect(mockedFindByID).toHaveBeenCalledTimes(1);
    expect(mockedFindByID).toHaveBeenCalledWith(address);
    await expect(mockedFindByID.mock.results[0].value).resolves.toStrictEqual(
      null
    );
  });

  test('should throw a generic error if connection to the database is broken, but log the real one', async () => {
    // the error message that the ODM should throw -- must never be returned as a API response
    // also this error must be logged once caught for monitoring purposes
    const ORMError = 'Error message from the ODM';
    // the error message that must be returned as a API response
    const AbstractError = 'DB: Internal error';
    // here we spyOn console.log in order to check that the real error is correctly logged
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
    const address = '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d';

    mockedFindByID.mockRejectedValue(ORMError);

    // call the function and check that it throws the correct error
    try {
      await getUser(address);
      // not expected to reach -- fail test if above expression doesn't throw anything.
      expect(true).toBe(false);
    } catch (error) {
      if (error instanceof DatabaseError) {
        // make sure the abstracted error is returned by the function, not the real one
        expect(error.message).toEqual(AbstractError);
      } else {
        // not expected to reach -- fail test if error thrown is not of type ConnectorError
        expect(true).toBe(false);
      }
    }

    // make sure the ODM function was called once with the correct arguments
    expect(mockedFindByID).toHaveBeenCalledTimes(1);
    expect(mockedFindByID).toHaveBeenCalledWith(address);
    await expect(mockedFindByID.mock.results[0].value).rejects.toEqual(
      ORMError
    );

    // make sure console.error was called once with the real error
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledWith(ORMError);

    // restore the console.error spyOn
    consoleErrorMock.mockRestore();
  });
});

describe('DB: updateUser', () => {
  // fixture data
  const payload: Payload.UpdateUser = {
    walletAddress: '0xd1699002d9548DCA840268ba1bd1afa27E0ba62d',
    values: { telegram: ['@test'], ifttt: ['test'] },
    timestamp: Date.now(),
    signature:
      '0x21fbf0696d5e0aa2ef41a2b4ffb623bcaf070461d61cf7251c74161f82fec3a4370854bc0a34b3ab487c1bc021cd318c734c51ae29374f2beb0e6f2dd49b4bf41c',
    publicKey:
      'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036415f',
  };

  // reset mocks before each test
  beforeEach(() => {
    mockedFindOneAndUpdate.mockReset();
  });

  test("shouldn't throw an error if everything is good", async () => {
    await expect(updateUser(payload)).resolves.not.toThrowError();
    expect(mockedFindOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(mockedFindOneAndUpdate).toHaveBeenCalledWith(
      { id: payload.walletAddress },
      payload.values,
      { upsert: true, strict: true }
    );
  });

  test('should throw a generic error if connection to the database is broken, but log the real one', async () => {
    // the error message that the ODM should throw -- must never be returned as a API response
    // also this error must be logged once caught for monitoring purposes
    const ORMError = 'Error message from the ODM';
    // the error message that must be returned as a API response
    const AbstractError = 'DB: Internal error';
    // here we spyOn console.log in order to check that the real error is correctly logged
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    mockedFindOneAndUpdate.mockRejectedValue(ORMError);

    // call the function and check that it throws the correct error
    try {
      await updateUser(payload);
      // not expected to reach -- fail test if above expression doesn't throw anything.
      expect(true).toBe(false);
    } catch (error) {
      if (error instanceof DatabaseError) {
        // make sure the abstracted error is returned by the function, not the real one
        expect(error.message).toEqual(AbstractError);
      } else {
        // not expected to reach -- fail test if error thrown is not of type ConnectorError
        expect(true).toBe(false);
      }
    }

    // make sure the ODM function was called once with the correct arguments
    expect(mockedFindOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(mockedFindOneAndUpdate).toHaveBeenCalledWith(
      { id: payload.walletAddress },
      payload.values,
      { upsert: true, strict: true }
    );
    await expect(mockedFindOneAndUpdate.mock.results[0].value).rejects.toEqual(
      ORMError
    );

    // make sure console.error was called once with the real error
    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledWith(ORMError);

    // restore the console.error spyOn
    consoleErrorMock.mockRestore();
  });
});
