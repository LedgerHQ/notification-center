import axios, { AxiosResponse } from 'axios';

type discordMessageResponse = {
  status: number;
  statusText: string;
  data: { id: string; content: string; channel_id: string };
};

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export const getDiscordSendMessageUrl = (channelId: string) =>
  `/channels/${channelId}/messages`;

export const sendMessage = async (
  chatId: string,
  text: string
): Promise<AxiosResponse<discordMessageResponse, discordMessageResponse>> => {
  const axiosInstance = axios.create({
    baseURL: 'https://discord.com/api',
    headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
  });

  try {
    // send a DM to chatId
    const response = await axiosInstance.post<discordMessageResponse>(
      getDiscordSendMessageUrl(chatId),
      {
        content: text,
      }
    );

    if (response.status !== 200)
      throw new Error(`${response.status}: ${response.statusText}`);

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
