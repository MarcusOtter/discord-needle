export interface NeedleConfig {
    threadChannels?: { channelId: string, messageContent: string }[];
    archiveImmediately: boolean;
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
        ERR_INSUFFICIENT_PERMS?: string,
        ERR_CHANNEL_VISIBILITY?: string,
        ERR_THREAD_MESSAGE_MISSING?: string,

        SUCCESS_THREAD_CREATE?: string,
        SUCCESS_THREAD_ARCHIVE?: string,
    },
}
