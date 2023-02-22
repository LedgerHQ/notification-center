# Notification center

![Quality checks](https://github.com/ledgerhq/notification-center/actions/workflows/quality.yml/badge.svg?branch=main)

Open source notification web service. It is used by [Ledger Fresh](https://github.com/LedgerHQ/ledger-fresh-management), our open source web wallet based on the account abstraction.

Wanna chat with us? Join our [Telegram group](https://t.me/+_cZcU5wZvyhmM2U0)

## Setup

Install all the dependencies using pnpm

```sh
pnpm install
```

Install the pre-push hook. It will run the linters and the tests before pushing your code.

```sh
npx lefhook install
```

Copy the `.env.example` into a new `.env` file and fill the missing required values

```sh
cp .env.example .env
```

## Run the tests

You can run the tests using the following command:

```sh
pnpm run test
```

## Start the application

First, you will need to install and start the [mongodb](https://www.mongodb.com/) service using the command below. Note there is no Dockerfile for the moment, so you will need to install MongoDB manually.

```sh
sudo service mongod start
```

You can run the server locally by using the following command:

```sh
pnpm dev
```

It will start an [Express](https://expressjs.com/fr/) server locally on the port defined in the .env file. You can then choose either to create a user using the `/updateNotificationPreferences` routes with its assigned payload:

```json
{
    "walletAddress": "",
    "values": {
        "telegram": ["", "", ""],
        "ifttt": ["", "", ""]
    },
    "timestamp": ,
    "signature": "",
    "publicKey": ""
}
```

or to send a notification to an existing user using the `/sendNotifications` routes with its assigned payload:

```json
{
  "to": "",
  "message": ""
}
```

## List of supported connectors

| Connector | Status | Documentation                               |
| --------- | ------ | ------------------------------------------- |
| IFTTT     | ✅     | [README](src/connectors/ifttt/README.md)    |
| Telegram  | ✅     | [README](src/connectors/telegram/README.md) |
| Email     | 👷‍♀️     | WIP                                         |
