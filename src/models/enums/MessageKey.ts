// TODO: Rename this to something like "settings" and give them a value of visible name to show in options.
// The enum can be turned into normal pascal case
// TODO: Make sure to remove old keys from the config.json file
enum MessageKey {
	ERR_UNKNOWN,
	ERR_ONLY_IN_SERVER,
	ERR_ONLY_IN_THREAD,
	ERR_ONLY_THREAD_OWNER /* TODO: Remove (it's a lie) */,
	ERR_NO_EFFECT,
	ERR_PARAMETER_MISSING,
	ERR_INSUFFICIENT_PERMS /* For a user, TODO: Add for bot */,
	ERR_CHANNEL_VISIBILITY,
	ERR_CHANNEL_SLOWMODE,
	ERR_AMBIGUOUS_THREAD_AUTHOR /* TODO: Remove */,

	SUCCESS_THREAD_CREATE,
	SUCCESS_THREAD_ARCHIVE_IMMEDIATE,
	SUCCESS_THREAD_ARCHIVE_SLOW,
}

export default MessageKey;
