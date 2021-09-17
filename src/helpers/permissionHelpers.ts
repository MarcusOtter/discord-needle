import { Permissions } from "discord.js";
import { getConfig } from "./configHelpers";

export function getRequiredPermissions(): bigint[] {
	const config = getConfig();
	const output = [
		Permissions.FLAGS.USE_PUBLIC_THREADS,

		/* TODO: Replace with SEND_MESSAGES_IN_THREADS when it is released */
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.READ_MESSAGE_HISTORY,
	];

	if (config?.threadMessage?.shouldPin) {
		output.push(Permissions.FLAGS.MANAGE_MESSAGES);
	}

	if (config?.threadMessage?.embeds?.length > 0) {
		output.push(Permissions.FLAGS.EMBED_LINKS);
	}

	return output;
}
