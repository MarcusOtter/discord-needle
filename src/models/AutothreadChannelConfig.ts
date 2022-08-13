import { Nullish } from "../helpers/typeHelpers";

export default class AutothreadChannelConfig {
	public readonly channelId: string;
	public readonly archiveImmediately: boolean;
	public readonly messageContent: string;
	public readonly includeBots: boolean;
	public readonly slowmode: number;
	public readonly titleFormat: string;
	public readonly customTitleFormat: string;
	public readonly statusReactions: boolean;

	constructor(
		oldConfig: Nullish<AutothreadChannelConfig>,
		channelId: string,
		archiveImmediately: Nullish<string>,
		messageContent: Nullish<string>,
		includeBots: Nullish<string>,
		slowmode: Nullish<number>,
		titleFormat: Nullish<string>,
		customTitleFormat: Nullish<string>,
		statusReactions: Nullish<string>
	) {
		this.channelId = channelId;
		this.archiveImmediately = archiveImmediately
			? archiveImmediately === "immediately"
			: oldConfig?.archiveImmediately ?? true;
		this.messageContent = messageContent ?? oldConfig?.messageContent ?? "";
		this.includeBots = includeBots ? includeBots === "on" : oldConfig?.includeBots ?? false;
		this.slowmode = slowmode ?? oldConfig?.slowmode ?? 0;
		this.titleFormat = titleFormat ?? oldConfig?.titleFormat ?? "defaultDiscord";
		this.customTitleFormat = customTitleFormat ?? oldConfig?.customTitleFormat ?? "";
		this.statusReactions = statusReactions ? statusReactions === "on" : oldConfig?.statusReactions ?? false;
	}
}
