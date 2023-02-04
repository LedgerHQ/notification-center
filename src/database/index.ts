import { Users } from './model';
import { Payload, User } from '../utils/types';

export async function updateUser(payload: Payload) {
  const user = await findUser(payload.walletAddress);

  if (!user) {
    console.log('➡️ Creating new user');
    newUser(
      payload.walletAddress,
      payload.values.telegrams,
      payload.values.emails,
      payload.values.ifttts
    );
  }
  if (user && payload.values.emails)
    addEmails(payload.walletAddress, payload.values.emails);
  if (user && payload.values.telegrams)
    addTelegrams(payload.walletAddress, payload.values.telegrams);
  if (user && payload.values.ifttts)
    addIfttts(payload.walletAddress, payload.values.ifttts);
}

// Insert a new user by wallet address into the collection
export function newUser(
  wallet_address: string,
  telegrams?: string[],
  emails?: string[],
  ifttts?: string[]
) {
  const user = new Users({
    id: wallet_address,
    channels: {
      telegrams: telegrams,
      emails: emails,
      ifttts: ifttts,
    },
  });

  user.save((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('➡️ User added successfully');
    }
  });
}

// Delete a user by wallet address from the collection
export function deleteUser(wallet_address: string) {
  Users.deleteOne({ id: wallet_address }, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('➡️ User deleted successfully!');
    }
  });
}

// Find a user by wallet address in the collection
export async function findUser(wallet_address: string): Promise<boolean> {
  try {
    const user = await Users.findOne({ id: wallet_address });
    if (!user) {
      console.log("➡️ User doesn't exist yet");
      return false;
    } else {
      console.log('➡️ User detected correctly');
      return true;
    }
  } catch (err) {
    console.log('The following error ocurred : ', err);
    return true;
  }
}

// Get a user by wallet address in the collection
export async function getUser(wallet_address: string): Promise<User | null> {
  try {
    const user = await Users.findOne({ id: wallet_address });
    if (!user) {
      console.log("➡️ User doesn't exist yet");
      return null;
    } else {
      console.log('➡️ User detected correctly');
      return user as User;
    }
  } catch (err) {
    console.log('➡️ The following error ocurred : ', err);
    return null;
  }
}

// Add a telegram handle to user by wallet in the collection
export function addTelegrams(wallet_address: string, telegrams: string[]) {
  Users.findOneAndUpdate(
    { id: wallet_address },
    {
      $push: {
        'channels.telegrams': {
          $each: telegrams,
        },
      },
    },
    (err: Error) => {
      if (err) {
        console.error(err);
      } else {
        console.log(
          '➡️ ' +
            telegrams +
            ' telegram(s) handle added successfully to user id : ' +
            wallet_address
        );
      }
    }
  );
}

// Add an email handle to user by wallet in the collection
export function addEmails(wallet_address: string, emails: string[]) {
  Users.findOneAndUpdate(
    { id: wallet_address },
    {
      $push: {
        'channels.emails': {
          $each: emails,
        },
      },
    },
    (err: Error) => {
      if (err) {
        console.error(err);
      } else {
        console.log(
          '➡️ ' +
            emails +
            ' email(s) handle added successfully to user id : ' +
            wallet_address
        );
      }
    }
  );
}

// Add an IFTTT key to user by wallet in the collection
export function addIfttts(wallet_address: string, ifttts: string[]) {
  Users.findOneAndUpdate(
    { id: wallet_address },
    {
      $push: {
        'channels.ifttts': {
          $each: ifttts,
        },
      },
    },
    (err: Error) => {
      if (err) {
        console.error(err);
      } else {
        console.log(
          '➡️ ' +
            ifttts +
            ' ifttts(s) handle added successfully to user id : ' +
            wallet_address
        );
      }
    }
  );
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
