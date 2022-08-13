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
		channelId: string,
		archiveImmediately: Nullish<boolean>,
		messageContent: Nullish<string>,
		includeBots: Nullish<boolean>,
		slowmode: Nullish<number>,
		titleFormat: Nullish<string>,
		customTitleFormat: Nullish<string>,
		statusReactions: Nullish<boolean>
	) {
		this.channelId = channelId;
		this.archiveImmediately = archiveImmediately ?? true;
		this.messageContent = messageContent ?? "";
		this.includeBots = includeBots ?? false;
		this.slowmode = slowmode ?? 0;
		this.titleFormat = titleFormat ?? "defaultDiscord";
		this.customTitleFormat = customTitleFormat ?? "";
		this.statusReactions = statusReactions ?? false;
	}
}
