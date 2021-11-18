export type SafeNeedleConfig = Omit<NeedleConfig, "discordApiToken" | "dev">

export interface NeedleConfig {
    discordApiToken?: string;
    threadChannels?: string[];
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

        SUCCESS_CONFIG_SET?: string,
        SUCCESS_THREAD_CREATE?: string,
        SUCCESS_THREAD_ARCHIVE?: string,
        SUCCESS_DURATION_SET?: string,
    },
    dev?: {
        clientId?: string,
        guildId?: string
    }
}
