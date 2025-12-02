// @ts-check
/*
This file is part of Needle.

Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
Affero General Public License as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with Needle.
If not, see <https://www.gnu.org/licenses/>.
*/

/* eslint-disable @typescript-eslint/no-var-requires */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";

const inputArg = process.argv.find(s => s.startsWith("--input"));
const outputArg = process.argv.find(s => s.startsWith("--output"));

if (!inputArg || !outputArg) {
	console.error("Missing --input or --output arg");
	process.exit();
}

if (inputArg === outputArg) {
	console.error("--input and --output args must be different");
	process.exit();
}

const inputDir = inputArg.split("=")[1];
const outputDir = outputArg.split("=")[1];

if (!existsSync(inputDir)) {
	console.error("Input folder doesn't exist");
	process.exit();
}

const fileNames = readdirSync(inputDir).filter(x => x.endsWith(".json"));
const toWrite = [];
for (const fileName of fileNames) {
	const fileContents = readFileSync(`${inputDir}/${fileName}`, "utf8");
	const oldGuildConfig = JSON.parse(fileContents);
	if (!oldGuildConfig) continue;

	const newGuildConfig = {
		settings: {
			ErrorUnknown: replace(oldGuildConfig.messages?.ERR_UNKNOWN),
			ErrorOnlyInThread: replace(oldGuildConfig.messages?.ERR_ONLY_IN_THREAD),
			ErrorNoEffect: replace(oldGuildConfig.messages?.ERR_NO_EFFECT),
			ErrorInsufficientUserPerms: replace(oldGuildConfig.messages?.ERR_INSUFFICIENT_PERMS),
			ErrorInsufficientBotPerms: undefined,
			ErrorMaxThreadRenames: undefined,

			SuccessThreadCreated: replace(oldGuildConfig.messages?.SUCCESS_THREAD_CREATE),
			SuccessThreadArchived:
				replace(oldGuildConfig.messages?.SUCCESS_THREAD_ARCHIVE_IMMEDIATE) ??
				replace(oldGuildConfig.messages?.SUCCESS_THREAD_ARCHIVE_SLOW),

			EmojiUnanswered: undefined,
			EmojiArchived: undefined,
			EmojiLocked: undefined,
		},
	};

	const newThreadChannels = [];
	for (const oldAutoThreadConfig of oldGuildConfig.threadChannels) {
		const hasCustomText = oldAutoThreadConfig?.messageContent?.length > 0;

		const newAutoThreadConfig = {
			channelId: oldAutoThreadConfig?.channelId,
			deleteBehavior: 3, // Nothing
			archiveImmediately: oldAutoThreadConfig?.archiveImmediately ? 1 : 0,
			replyType: hasCustomText ? 1 : 0,
			customReply: replace(oldAutoThreadConfig?.messageContent) ?? "",
			includeBots: oldAutoThreadConfig?.includeBots ? 1 : 0,
			slowmode: oldAutoThreadConfig?.slowmode ?? 0,
			statusReactions: 0,
			titleType: 1,
			titleMaxLength: 50,
			regexJoinText: "",
			customTitle: "$USER_NICKNAME ($DATE_UTC)",
			closeButtonText: "Archive thread",
			closeButtonStyle: "green",
			titleButtonText: "Edit title",
			titleButtonStyle: "blurple",
		};

		newThreadChannels.push(newAutoThreadConfig);
	}

	newGuildConfig.threadChannels = newThreadChannels;
	toWrite.push({ path: `${outputDir}/${fileName}`, content: JSON.stringify(newGuildConfig) });
}

if (existsSync(outputDir)) {
	console.error("Output folder already exists. Overwriting in 10 seconds.");
	await new Promise(resolve => setTimeout(resolve, 10000));
	rmSync(outputDir, { recursive: true });
}

mkdirSync(outputDir);
for (const { path, content } of toWrite) {
	try {
		writeFileSync(path, content, { flag: "w+" });
	} catch (e) {
		console.error("Error writing " + path);
		console.error(e);
	}
}

/**
 * @param {string | undefined} input
 * @returns {string | undefined}
 */
function replace(input) {
	return input
		?.replace(/\\n/g, "\n")
		.replace(/\$USER/g, "$USER_MENTION")
		.replace(/\$CHANNEL/g, "$CHANNEL_MENTION");
}
