import NeedleEventListener from "../models/NeedleEventListener";

export default class ReadyEventListener extends NeedleEventListener<"ready"> {
	public getListenerType(): "on" | "once" {
		return "on";
	}

	public async handleEventEmitted(): Promise<void> {
		console.log("We're ready!");
	}
}

// const event = new ReadyEventListener(null, "ready");
// export default event;
