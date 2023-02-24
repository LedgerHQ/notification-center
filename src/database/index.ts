import { Users } from './model';
import { Payload, Database } from '../types';

// TODO: rename user to wallet (UpdateUser -> UpdateWallet)

// Custom error class to identify errors thrown when interacting with the ODM
export class DatabaseError extends Error {
  constructor(cause: string) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }

    this.name = 'DatabaseError';
    this.message = `DB: ${cause}`;
  }
}

// Get a user by wallet address in the collection
export const getUser = async (
  wallet_address: string
): Promise<Database.User | null> => {
  try {
    const user = await Users.findOne<Database.User>({
      id: wallet_address,
    }).exec();
    return user;
  } catch (err) {
    console.error(err);
    // abstract the error from the ODM
    throw new DatabaseError('Internal error');
  }
};

export const updateUser = async (payload: Payload.UpdateUser) => {
  try {
    // Find the user, update it with the new values if it exists, otherwise create it directly

    // OPINIATED: In order to keep the application simple, and to have the least amount
    // of logic in this file, I decided to use a find and replace logic.
    // `payload.values` override the current values in the database
    // Note that the strict option is enabled  meaning values that are not defined in the schema will be ignored
    await Users.findOneAndUpdate(
      { id: payload.walletAddress },
      { $set: { channels: payload.values } },
      { upsert: true, strict: true }
    );
  } catch (err) {
    console.error(err);
    // abstract the error from the ODM
    throw new DatabaseError('Internal error');
  }
};
