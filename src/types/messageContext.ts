import { CacheType, Interaction, Message, TextBasedChannels, User } from "discord.js";

export interface MessageContext {
    interaction?: Interaction<CacheType>;
    message?: Message;

    // Variables that can be used in messages (if they exist at the time of invocation)
    // To use in message configuration, prefix with $ and convert name to SCREAMING_SNAKE_CASE
    // For example, $TIME_AGO and $USER
    channel?: TextBasedChannels;
    user?: User;
    timeAgo?: string;
}
