import NeedleEventListener from "../models/NeedleEventListener";

export default class ReadyEventListener extends NeedleEventListener {
	public getListenerType(): "on" | "once" {
		return "on";
	}

	public async handleEventEmitted(): Promise<void> {
		console.log("We're ready!");
	}
}
