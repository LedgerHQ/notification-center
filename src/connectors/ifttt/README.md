# IFTTT Connector

# Context

IFTTT stands for "If This Then That." It is a web-based automation tool that allows you to connect different apps and services together using simple conditional statements called "applets".

An applet consists of a trigger and an action. The trigger is an event that occurs in one app, such as receiving an email or a tweet, while the action is a corresponding task that should happen in another app, such as saving the email attachment to your Dropbox or sending the tweet to your Evernote notebook.

IFTTT supports a wide range of apps and services, including social media platforms, smart home devices, email providers, and productivity tools. With IFTTT, you can automate repetitive tasks and create custom workflows to streamline your daily routine.

# Description

This connector is a JavaScript class called IFTTTConnector which extends the DefaultConnector class and implements the IConnector interface.

The IFTTTConnector class is responsible for sending notifications to the IFTTT (If This Then That) service using the notify method.

The notify method accepts two arguments, a message and an array of targets. In this context, the targets correspond to the endpoints of the applets created by the user to receive notifications from our service.

To use the IFTTTConnector class, the user must first request our updateUser route and provide the number of IFTTT endpoints they want to receive notifications at. The frontend of Fresh is expected to abstract this updating request. However, during the creation process of the IFTTT applet by the user, the user must use the same IFTTT_EVENT_NAME that we use in the IFTTTConnector class, this is important.

When the notify method is called, it creates an iterable of promises by mapping over the targets array and sending a POST request to the corresponding IFTTT endpoint using the axios library.

The class has two private fields (#IFTTT_EVENT_NAME and #BASE_URL) that are used to construct the URL for sending requests to the IFTTT service.

The constructor method calls the constructor of the parent class DefaultConnector passing the name of the class as an argument.

The Promise.allSettled() method is used to wait for all the requests to complete and get back the results and status of each promise. The method then checks if all the requests have been rejected, and if so, it throws an error.
