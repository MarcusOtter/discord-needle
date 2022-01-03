import { MessageAttachment } from "discord.js";
import { Readable } from "stream";

export function createJsonMessageAttachment(obj: unknown, fileName: string, indentation = 2): MessageAttachment {
	const stream = Readable.from(JSON.stringify(obj, undefined, indentation), { encoding: "utf-8" });
	return new MessageAttachment(stream, fileName);
}
