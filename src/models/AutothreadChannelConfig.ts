import { ToggleOption } from "../commands/auto-thread";
import { Nullish } from "../helpers/typeHelpers";

export default class AutothreadChannelConfig {
	public readonly channelId: string;
	public readonly archiveImmediately: ToggleOption;
	public readonly replyMessage: string;
	public readonly includeBots: ToggleOption;
	public readonly slowmode: number;
	public readonly titleFormat: string;
	public readonly statusReactions: ToggleOption;

	constructor(
		oldConfig: Nullish<AutothreadChannelConfig>,
		channelId: string,
		archiveImmediately: Nullish<ToggleOption>,
		replyMessage: Nullish<string>,
		includeBots: Nullish<ToggleOption>,
		slowmode: Nullish<number>,
		titleFormat: Nullish<string>,
		statusReactions: Nullish<ToggleOption>
	) {
		this.channelId = channelId;
		this.archiveImmediately = archiveImmediately ?? oldConfig?.archiveImmediately ?? ToggleOption.On;
		this.replyMessage = replyMessage ?? oldConfig?.replyMessage ?? "";
		this.includeBots = includeBots ?? oldConfig?.includeBots ?? ToggleOption.Off;
		this.slowmode = slowmode ?? oldConfig?.slowmode ?? 0;
		this.titleFormat = titleFormat ?? oldConfig?.titleFormat ?? "defaultDiscord"; // TODO: Change
		this.statusReactions = statusReactions ?? oldConfig?.statusReactions ?? ToggleOption.Off;
	}
}
