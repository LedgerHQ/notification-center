import { Users } from './model';
import { Payload, User, ChannelsEnum } from '../utils/types';

export async function updateUser(payload: Payload) {
  let user = await getUser(payload.walletAddress);

  if (!user) {
    console.log('➡️ Creating new user');
    user = await newUser(payload.walletAddress, payload.values);
  }

  Object.entries(payload.values).map(([key, values]) => {
    // TODO: cast + improve?
    addChannelValues(payload.walletAddress, key as ChannelsEnum, values);
  });
}

// Insert a new user by wallet address into the collection
export async function newUser(
  wallet_address: string,
  channels: Payload['values']
): Promise<User> {
  try {
    const user = new Users({ id: wallet_address, channels: { ...channels } });
    const savedUser = await user.save();

    // TODO:
    if (!savedUser) throw new Error('user.save() -- internal error');

    console.log('➡️ User added successfully');
    // TODO: ensure this is okay
    return savedUser as User;
  } catch (err) {
    console.error('➡️ The following error ocurred : ', err);
    throw err;
  }
}

// Delete a user by wallet address from the collection
export async function deleteUser(wallet_address: string) {
  try {
    await Users.deleteOne({ id: wallet_address });
    console.log('➡️ User deleted successfully!');
  } catch (err) {
    console.error('➡️ The following error ocurred : ', err);
  }
}

// Get a user by wallet address in the collection
export async function getUser(wallet_address: string): Promise<User | null> {
  try {
    const user = await Users.findOne<User>({ id: wallet_address });
    return user;
  } catch (err) {
    console.error('➡️ The following error ocurred : ', err);
    return null;
  }
}

// Add a channel handle to user by wallet in the collection
export async function addChannelValues(
  wallet_address: string,
  key: ChannelsEnum,
  values: string[]
) {
  try {
    const user = await Users.findOneAndUpdate(
      { id: wallet_address },
      { $push: { [`channels.${key}`]: { $each: values } } }
    );

    if (user === null) {
      throw new Error('Users.findOneAndUpdate -- internal error');
    }
    console.log(
      '➡️ ' +
        values +
        ` ${key} handle added successfully to user id : ` +
        wallet_address
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Delete a telegram handle from a user by wallet in the collection
export function deleteTelegram(wallet_address: string, telegram: string) {
  Users.findOneAndUpdate(
    { id: wallet_address },
    {
      $pullAll: {
        'channels.telegrams': [telegram],
      },
    },
    (err: Error) => {
      if (err) {
        console.error(err);
      } else {
        console.log(
          '➡️ ' +
            telegram +
            ' telegram handle removed successfully from user id : ' +
            wallet_address
        );
      }
    }
  );
}

// Delete an email handle from a user by wallet in the collection
export function deleteEmail(wallet_address: string, email: string) {
  Users.findOneAndUpdate(
    { id: wallet_address },
    {
      $pullAll: {
        'channels.emails': [email],
      },
    },
    (err: Error) => {
      if (err) {
        console.error(err);
      } else {
        console.log(
          '➡️ ' +
            email +
            ' email handle removed successfully from user id : ' +
            wallet_address
        );
      }
    }
  );
}

// Delete an IFTTT from a user by wallet in the collection
export function deleteIfttt(wallet_address: string, ifttt: string) {
  Users.findOneAndUpdate(
    { id: wallet_address },
    {
      $pullAll: {
        'channels.ifttts': [ifttt],
      },
    },
    (err: Error) => {
      if (err) {
        console.error(err);
      } else {
        console.log(
          '➡️ ' +
            ifttt +
            ' ifttt handle removed successfully from user id : ' +
            wallet_address
        );
      }
    }
  );
}
