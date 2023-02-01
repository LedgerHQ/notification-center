import express, { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { createVerify } from 'crypto';
import * as bodyParser from "body-parser";
import { verify as verifSigner } from 'jsonwebtoken'
import { NotificationPayload, payload, User, Values } from './utils/types'
import { getUser, updateUser } from './database';
import dotenv from 'dotenv';
import { telegramPlugin } from './plugins/telegram/telegramPlugin';

export function getServices(user: User): Values {
    return (user.channels);
}

export function getTelegramHandles(user: User): string[] {
    return (user.channels.telegrams)
}

export function getEmailHandles(user: User): string[] {
    return (user.channels.emails)
}


export async function sendNotifications(payload: NotificationPayload): Promise<User | null> {
    try {
        const user = await getUser(payload.to);
        if (!user)
            return null;
        else {
            const services = getServices(user);
            if (services.telegrams) {
                // Sending notification message to the telegram handles
                console.log('➡️ Telegram handles detected');
                telegramPlugin(payload.message, getTelegramHandles(user));
            }
            if (services.emails) {
                // Sending notification message to the email handles
                console.log('➡️ Mail handles detected');
                // emailPlugin(payload.message, getEmailHandles(user));
            }
            return user as User;
        }
    } catch (err) {
        console.log('➡️ The following error ocurred : ', err);
        return null;
    }
}