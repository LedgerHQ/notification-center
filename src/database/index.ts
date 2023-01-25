import { Users } from './model'
import { User } from '../utils/types'

// Insert a new user by wallet address into the collection
export function newUser(wallet_address: string, telegrams: string[], emails: string[]) {
    const user = new Users({
        id: wallet_address,
        channels: {
            telegrams: telegrams,
            emails: emails
        }   
    })

    user.save((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("User added successfully!");
        }
    });
}

// Delete a user by wallet address from the collection
export function deleteUser(wallet_address: string) {
    Users.deleteOne({ id: wallet_address }, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("User deleted successfully!");
        }
    });
}
  
// Find a user by wallet address in the collection
export function findUser(wallet_address: string) {
  Users.findOne({ id: wallet_address }, (err: any, user: User) => {
    if (err) {
      console.log(err);
    } else {
      console.log(user);
    }
  });
}
  
// Add a telegram handle to user by wallet in the collection
export function addTelegram(wallet_address: string, telegram: string) {
    Users.findOneAndUpdate({ id: wallet_address }, {
        $push: {
            "channels.telegrams": telegram
        }
    }, (err: any) => {
        if (err) {
            console.log(err);
        } else {
            console.log(telegram + " telegram handle added successfully to user id : " + wallet_address);
        }
    });
}

// Add an email handle to user by wallet in the collection
export function addMail(wallet_address: string, email: string) {
    Users.findOneAndUpdate({ id: wallet_address }, {
        $push: {
            "channels.emails": email
        }
    }, (err: any) => {
        if (err) {
            console.log(err);
        } else {
            console.log(email + " email handle added successfully to user id : " + wallet_address);
      }
    });
}

// Delete a telegram handle from a user by wallet in the collection
export function deleteTelegram(wallet_address: string, telegram: string) {
    Users.findOneAndUpdate({ id: wallet_address }, {
        $pullAll: {
            "channels.telegrams": [telegram],
        },
    }, (err: any) => {
        if (err) {
            console.log(err);
        } else {
            console.log(telegram + " telegram handle removed successfully from user id : " + wallet_address);
        }
    });
}

// Delete an email handle from a user by wallet in the collection
export function deleteEmail(wallet_address: string, email: string) {
    Users.findOneAndUpdate({ id: wallet_address }, {
        $pullAll: {
            "channels.telegrams": [email],
        },
    }, (err: any) => {
        if (err) {
            console.log(err);
        } else {
            console.log(email + " email handle removed successfully from user id : " + wallet_address);
        }
    });
}
