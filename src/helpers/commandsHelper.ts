import { SlashCommandBuilder } from "@discordjs/builders";
import { BaseCommandInteraction } from "discord.js";
import { promises } from "fs";
import { resolve } from "path";

const COMMANDS_PATH = resolve(__dirname, "../commands");

export interface NeedleCommand {
	info: SlashCommandBuilder;
	execute(interaction: BaseCommandInteraction): Promise<void>;
}

let loadedCommands: NeedleCommand[] = [];
export async function reloadCommands(): Promise<void> {
	console.log("Started reloading commands.");
	loadedCommands = await getAllCommands();
	console.log("Successfully reloaded commands.");
}

export async function getAllCommands(): Promise<NeedleCommand[]> {
	const commandFiles = await promises.readdir(COMMANDS_PATH);
	commandFiles.filter(file => file.endsWith(".js"));

	const output = [];
	for (const file of commandFiles) {
		const { command } = await import(`${COMMANDS_PATH}/${file}`);
		output.push(command);
	}

	return output;
}

export function getCommand(commandName: string): NeedleCommand | undefined {
	if (loadedCommands.length === 0) {
		console.error("No commands found. Did you forget to invoke \"reloadCommands()\"?");
	}

	return loadedCommands.find(command => command.info.name === commandName);
}
