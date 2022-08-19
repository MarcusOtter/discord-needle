enum Setting {
	ErrorUnknown,
	ErrorOnlyInThread,
	ErrorNoEffect,
	ErrorInsufficientUserPerms,
	ErrorInsufficientBotPerms, // TODO: Append missing permissions to this msg

	SuccessThreadCreate,
	SuccessThreadArchiveImmediate,
	SuccessThreadArchiveSlow,

	ButtonArchive,
	ButtonEditTitle,
	ButtonCommands,
}

export default Setting;
