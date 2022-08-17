import ListenerRunType from "../models/enums/ListenerRunType";
import NeedleEventListener from "../models/NeedleEventListener";

export default class ReadyEventListener extends NeedleEventListener {
	public readonly name = "ready";
	public readonly runType = ListenerRunType.OnlyOnce;

	public async handle(): Promise<void> {
		console.log("Ready!");
		// TODO: Delete unknown configs from servers
		// TODO: Loop through all auto-thread channels, check latest message. If it doesn't have a thread (and should have a thread on it), try to create a thread on it.
		// Repeat this process for other missed messages in said channel until we find one with a thread that should have a thread.
		// We might run into rate limits if bot has been offline for a long time, so we should probably also have some flag that
		// says if we should skip this process. By default it should be on though, I think.
	}
}
