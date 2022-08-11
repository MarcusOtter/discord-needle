import ListenerRunType from "../models/enums/ListenerRunType";
import NeedleEventListener from "../models/NeedleEventListener";

export default class ReadyEventListener extends NeedleEventListener {
	public getRunType(): ListenerRunType {
		return ListenerRunType.OnlyOnce;
	}

	public async onEmitted(): Promise<void> {
		console.log("Ready!");
		// TODO: Delete unknown configs from servers
	}
}