export type User = {
    id: string, // wallet address
    channels : {
        telegrams: string[], // Telegram handles
        emails: string[], // Mail handles
    }
}

export type Values = {
    telegrams?: string[],
    emails?: string[],
};

export type payload = {
    walletAddress: string,
    values: Values,
    timestamp: number,
    signature: string,
    publicKey: string,
}