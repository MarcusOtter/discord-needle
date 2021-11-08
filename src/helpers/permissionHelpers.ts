import { Permissions } from "discord.js";

export function getRequiredPermissions(): bigint[] {
	const output = [
		Permissions.FLAGS.USE_PUBLIC_THREADS,
		Permissions.FLAGS.SEND_MESSAGES_IN_THREADS,
		Permissions.FLAGS.READ_MESSAGE_HISTORY,
	];

	return output;
}
