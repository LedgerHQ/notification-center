# Notification center

Open source notification web service. It is used by [Ledger Fresh](https://github.com/LedgerHQ/ledger-fresh-management), our open source web wallet based on the account abstraction.

Wanna chat with us? Join our [Discord channel](https://discord.com/channels/885256081289379850/1053266126953529374)

## Setup

Install the dependencies using pnpm

```sh
pnpm install
```

Install the pre-push hook

```sh
npx lefhook install
```

## Testing

First, you will need to install and start the [mongodb](https://www.mongodb.com/) service using this command :

```sh
sudo service mongod start
```

You can test it locally using :

```sh
pnpm start
```

It will start an [Express](https://expressjs.com/fr/) server locally on the port defined in the .env file. You can then chose either to create a user using the `/updateNotificationPreferences` routes with it's assigned payload :

```json
{
    "walletAddress": "",
    "values": {
        "telegrams": ["", "", ""],
        "emails": ["", "", ""]
    },
    "timestamp": ,
    "signature": "",
    "publicKey": ""
}
```

or to send a notification to an existing user using the `/sendNotification` routes with it's assigned payload :

```json
{
  "to": "",
  "message": ""
}
```

⚠️ Only [Telegram](https://telegram.org) and [Email](https://mail.google.com) services are supported for now, don't forget to configure the .env with the necessary api, you can see .env.example for more info.
