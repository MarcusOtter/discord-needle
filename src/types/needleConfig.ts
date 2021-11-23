export type SafeNeedleConfig = Omit<NeedleConfig, "discordApiToken" | "dev">

export interface NeedleConfig {
    discordApiToken?: string;
    threadChannels?: { channelId: string, messageContent: string }[];
    messages?: {
        ERR_UNKNOWN?: string,
        ERR_ONLY_IN_SERVER?: string,
        ERR_ONLY_IN_THREAD?: string,
        ERR_ONLY_THREAD_OWNER?: string,
        ERR_NO_EFFECT?: string,
        ERR_JSON_MISSING?: string,
        ERR_JSON_INVALID?: string,
        ERR_CONFIG_INVALID?: string;
        ERR_PARAMETER_MISSING?: string,
        ERR_THREAD_MESSAGE_MISSING?: string,

        SUCCESS_THREAD_CREATE?: string,
        SUCCESS_THREAD_ARCHIVE?: string,
    },
    dev?: {
        clientId?: string,
        guildId?: string
    }
}
