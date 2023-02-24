# Notification center

![Quality checks](https://github.com/ledgerhq/notification-center/actions/workflows/quality.yml/badge.svg?branch=main)

Open source notification web service. It is used by [Ledger Fresh](https://github.com/LedgerHQ/ledger-fresh-management), our open source web wallet based on the account abstraction.

Wanna chat with us? Join our [Telegram group](https://t.me/+_cZcU5wZvyhmM2U0)

## Setup

Install all the dependencies using pnpm. pnpm is a fast, disk space efficient package manager. It is used by the Ledger team and we recommend you to use it too. You can install it following the [official documentation](https://pnpm.io/installation).

```sh
pnpm install
```

Install the pre-push git hook using lefthook. Lefthook is a fast and powerful Git hooks manager for Node.js, Ruby or any other type of projects. By installing the pre-push hook, a CI will automatically run locally before pushing your code. You can install it following the [official documentation](https://github.com/evilmartians/lefthook/blob/master/docs/install.md).

```sh
npx lefhook install
```

Copy the `.env.example` into a new `.env` file and fill the missing required values.

```sh
cp .env.example .env
```

## Run the tests

You can run the tests using the following command:

```sh
pnpm run test
```

Using lefthook, you can run the local CI running the following command:

```sh
pnpm run lefthook
```

## Start the application locally

First, you will need to install and start the [mongodb](https://www.mongodb.com/) service using the command below. MongoDB is a cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas. Note there is no Dockerfile for the moment, so you will need to install MongoDB manually. You can install it following the [official documentation](https://docs.mongodb.com/manual/installation/). Once installed, run the following command to start the service:

On Debian/Ubuntu:

```sh
sudo service mongod start
```

On MacOS:

```sh
brew services start mongodb-community
```

In order to run the server locally, you will need to fill the environnement variables named `DB_URL` in the [`.env`](./.env) file. If you didn't custom the the service, the default value filled in the `.env.example` file should be fine.

Now that the database is running, you can start the server using the following command:

```sh
pnpm dev
```

It will start an [Express](https://expressjs.com/fr/) server locally on the port defined in the .env file. Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

At this point, you should be able to access the server and ping it. However, connectors are not yet available, meaning the notification workflow will fail. You can check the [list of supported connectors](#list-of-supported-connectors) to know which one are available and how to use/configure them by following the documentation.

## List of supported connectors

| Connector | Status | Documentation                               |
| --------- | ------ | ------------------------------------------- |
| IFTTT     | ✅     | [README](src/connectors/ifttt/README.md)    |
| Telegram  | ✅     | [README](src/connectors/telegram/README.md) |
| Email     | 👷‍♀️     | WIP                                         |
