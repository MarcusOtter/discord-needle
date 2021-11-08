import { CacheType, Interaction, Message, TextBasedChannels, User } from "discord.js";

export interface MessageContext {
    invoker?: User;
    interaction?: Interaction<CacheType>;
    sourceChannel?: TextBasedChannels;
    sourceMessage?: Message;
    errorReason?: string;
    guildId?: string;
}
