// IMPORTANT: Remember to change config.json when you are changing anything here
enum Setting {
	ErrorUnknown = 0,
	ErrorOnlyInThread,
	ErrorNoEffect,
	ErrorInsufficientUserPerms,
	ErrorInsufficientBotPerms,
	ErrorMaxThreadRenames,

	SuccessThreadCreated,
	SuccessThreadArchived,
}

export default Setting;
