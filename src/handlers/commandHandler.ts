import { type CommandInteraction, type MessageComponentInteraction } from "discord.js";
import { promises } from "fs";
import { resolve as pathResolve } from "path";
import { getMessage, interactionReply } from "../helpers/messageHelpers";
import type { NeedleCommand } from "../types/needleCommand";

const COMMANDS_PATH = pathResolve(__dirname, "../commands");

let loadedCommands: NeedleCommand[] = [];

export function handleCommandInteraction(interaction: CommandInteraction): Promise<void> {
	const command = getCommand(interaction.commandName);
	if (!command) return Promise.reject();

	try {
		return command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
	}
}

export async function handleButtonClickedInteraction(interaction: MessageComponentInteraction): Promise<void> {
	const command = getCommand(interaction.customId);
	if (!command) return Promise.reject();

	try {
		return command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
	}
}

export async function getOrLoadAllCommands(allowCache = true): Promise<NeedleCommand[]> {
	if (loadedCommands.length > 0 && allowCache) {
		return loadedCommands;
	}

	console.log("Started reloading commands from disk.");

	const commandFiles = await promises.readdir(COMMANDS_PATH);
	commandFiles.filter(file => file.endsWith(".js"));
	const output = [];
	for (const file of commandFiles) {
		const { command } = await import(`${COMMANDS_PATH}/${file}`);
		output.push(command);
	}

	console.log("Successfully reloaded commands from disk.");
	loadedCommands = output;
	return output;
}

export function getAllLoadedCommands(): NeedleCommand[] {
	if (loadedCommands.length === 0) {
		console.error("No commands found. Did you forget to invoke \"getOrLoadAllCommands()\"?");
	}

	return loadedCommands;
}

export function getCommand(commandName: string): NeedleCommand | undefined {
	if (loadedCommands.length === 0) {
		console.error("No commands found. Did you forget to invoke \"getOrLoadAllCommands()\"?");
	}

	return loadedCommands.find(command => command.name === commandName);
}
