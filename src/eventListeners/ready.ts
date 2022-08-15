import ListenerRunType from "../models/enums/ListenerRunType";
import NeedleEventListener from "../models/NeedleEventListener";

export default class ReadyEventListener extends NeedleEventListener {
	public readonly name = "ready";
	public readonly runType = ListenerRunType.OnlyOnce;

	public async handle(): Promise<void> {
		console.log("Ready!");
		// TODO: Delete unknown configs from servers
	}
}
