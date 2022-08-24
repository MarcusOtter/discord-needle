// IMPORTANT: Remember to change config.json when you are changing anything here
enum Setting {
	ErrorUnknown,
	ErrorOnlyInThread,
	ErrorNoEffect,
	ErrorInsufficientUserPerms,
	ErrorInsufficientBotPerms, // TODO: Append missing permissions to this msg
	ErrorMaxThreadRenames,

	SuccessThreadCreate,
	SuccessThreadArchiveImmediate,
	SuccessThreadArchiveSlow,
}

export default Setting;
