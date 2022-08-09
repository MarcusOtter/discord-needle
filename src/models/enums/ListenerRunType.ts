enum ListenerRunType {
	/**
	 * Run this listener every time an the event is emitted.
	 */
	EveryTime = "on",

	/**
	 * Only run this listener the first time the event is emitted.
	 */
	OnlyOnce = "once",
}

export default ListenerRunType;
