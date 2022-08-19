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

	// TODO: Get these from /auto-thread reply-buttons instead
	ButtonTextClose,
	ButtonTextTitle,
	ButtonTextHelp,
}

export default Setting;
