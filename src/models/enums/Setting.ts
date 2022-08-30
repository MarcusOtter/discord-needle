// IMPORTANT: Remember to change defaultConfig in NeedleConfig.ts when you are changing anything here
enum Setting {
	ErrorUnknown = 0,
	ErrorOnlyInThread,
	ErrorNoEffect,
	ErrorInsufficientUserPerms,
	ErrorInsufficientBotPerms,
	ErrorMaxThreadRenames,

	SuccessThreadCreated,
	SuccessThreadArchived,

	EmojiUnanswered,
	EmojiArchived,
	EmojiLocked,
}

export default Setting;
