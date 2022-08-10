import type {
	ChatInputCommandInteraction,
	Message,
	MessageComponentInteraction,
	ModalSubmitInteraction,
	User,
} from "discord.js";
import type NeedleBot from "../NeedleBot";
import NeedleConfig from "./NeedleConfig";

export default class InteractionContext {
	public readonly bot: NeedleBot;
	public readonly interaction: NeedleInteraction;
	public readonly messages: NeedleConfig["messages"];
	// TODO: Message context?

	// TODO: I feel like this constructor will need async eventually, so we should prolly move it to ObjectFactory
	constructor(bot: NeedleBot, interaction: NeedleInteraction) {
		this.bot = bot;
		this.interaction = interaction;

		// Actually, we could be cheeky and inject the message variables here, if we had the context!
		// Even more actually, maybe we can construct the context from here? But it would depend on interaction I think.
		this.messages = bot.configs.get(interaction.guildId ?? "").messages;

		// It would be really cool to get all interaction options dynamically in the interaction context
		// We would have to make it generic or add a new method on it, but it could call the getBuilder() method of a command
		// and return stuff
	}

	public async getThreadAuthor(): Promise<User | undefined> {
		const parentMessage = await this.getThreadStartMessage();
		if (parentMessage) return parentMessage.author;

		// TODO: Implement https://github.com/MarcusOtter/discord-needle/issues/68
		// Before we had some code here to determine thread author using pings
		return undefined;
	}

	private async getThreadStartMessage(): Promise<Message | null> {
		const thread = this.interaction.channel;

		if (!thread?.isThread()) return null;
		if (!thread.parent?.isTextBased()) return null;

		// The thread's channel ID is the same as the start message's ID,
		// but if the start message has been deleted this will throw an exception
		return thread.parent.messages.fetch(thread.id).catch(() => null);
	}
}

type NeedleInteraction = ChatInputCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction;
