import type {
	ChatInputCommandInteraction,
	MessageComponentInteraction,
	ModalSubmitInteraction,
	RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";

export default abstract class NeedleCommand {
	private name: string;
	private shortDescription: string;
	private longDescription: string;

	constructor(name: string, shortDescription: string, longDescription: string) {
		this.name = name;
		this.shortDescription = shortDescription;
		this.longDescription = longDescription;
	}

	public getName(): string {
		return this.name;
	}

	public getShortDescription(): string {
		return this.shortDescription;
	}

	public getLongDescription(): string {
		return this.longDescription;
	}

	public abstract getSlashCommandBuilder(): Promise<RESTPostAPIApplicationCommandsJSONBody>;
	public abstract executeFromChatInput(interaction: ChatInputCommandInteraction): Promise<void>;
	public abstract executeFromButtonClick(interaction: MessageComponentInteraction): Promise<void>;
	public abstract executeFromModalSubmit(interaction: ModalSubmitInteraction): Promise<void>;
}
