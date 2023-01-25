export type User = {
    id: string, // wallet address
    channels : {
        telegrams: string[], // Telegram handles
        emails: string[], // Mail handles
    }
 }