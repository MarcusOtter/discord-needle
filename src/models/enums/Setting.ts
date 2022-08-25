// IMPORTANT: Remember to change config.json when you are changing anything here
enum Setting {
	ErrorUnknown = 0,
	ErrorOnlyInThread,
	ErrorNoEffect,
	ErrorInsufficientUserPerms,
	ErrorInsufficientBotPerms, // TODO: Append missing permissions to this msg
	ErrorMaxThreadRenames,

	SuccessThreadCreated,
	SuccessThreadArchived,
}

export default Setting;
