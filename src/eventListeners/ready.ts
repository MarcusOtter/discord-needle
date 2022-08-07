import ListenerRunType from "../models/enums/ListenerRunType";
import NeedleEventListener from "../models/NeedleEventListener";

export default class ReadyEventListener extends NeedleEventListener {
	public getListenerType(): ListenerRunType {
		return ListenerRunType.OnlyOnce;
	}

	public async handleEventEmitted(): Promise<void> {
		console.log("Ready!");
	}
}
