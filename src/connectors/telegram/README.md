# Telegram Connector

# Context

Telegram is a cloud-based instant messaging and voice-over-IP service. It was launched in 2013 and is available as a mobile application for iOS, Android, and Windows Phone platforms, as well as for desktops running Windows, macOS, and Linux.

Telegram provides a secure and private messaging service, with end-to-end encryption available for secret chats. It also supports group chats with up to 200,000 members, voice and video calls, and file sharing. Additionally, Telegram has an open API and a bot platform that allows developers to create chatbots and automation tools for the messaging service.

# Description

This connector is a JavaScript class that extends the DefaultConnector class and implements the IConnector interface. Its main responsibility is to send notifications to the Telegram messaging service using the notify method.

The notify method takes in two arguments, a message and an array of targets, where targets correspond to Telegram chat IDs that the notification should be sent to. In order to receive a notification on Telegram, the user must first start a conversation with our bot, which our frontend application is expected to facilitate by redirecting the user to the correct conversation and prompting them to accept the conversation.

The chat_id is a required piece of information to receive a Telegram notification, as it is not possible to send a message to a user by targeting their handle. However, the official Telegram interface does not provide users with their chat_id, which is why we have configured the bot to automatically send the chat_id to the user when they send one of the authorized commands to the bot, such as /start or /fresh. The command /start is automatically sent to the bot when the user starts a conversation with it, meaning the chat_id is sent to the user as soon as they start a conversation with the bot.

To subscribe to notifications, the user must send their chat_id to our server by calling the /updateUser route. Our frontend application is expected to abstract this request, so that the user doesn't have to manually request our server. All the user has to do is start a conversation with the bot, copy the chat_id send to him by the bot, and paste it into the frontend application.

When the notify method is called, it creates an iterable of promises by mapping over the targets array and calling the sendMessage function, passing in the corresponding target and message arguments. The method then waits for all the promises to resolve using the Promise.allSettled() method and gets back the results and status of each promise.

The method then checks if at least one of the requests has been fulfilled, and if so, it considers the notification as sent. If none of the requests have been fulfilled, it throws an error indicating that it was impossible to reach the Telegram service.

The constructor method of the TelegramConnector class calls the constructor of the parent class DefaultConnector, passing in the name of the class as an argument.

# Testing it locally

Follow the instructions in the following link to test the Telegram connector locally: [here](https://github.com/LedgerHQ/notification-center/wiki/Telegram-Connector-How-to-configure-and-test-it-locally)
