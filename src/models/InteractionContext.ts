import type NeedleBot from "../NeedleBot";
import type { ValidChatInputCommandInteraction } from "../validators/InteractionValidator";

export default class InteractionContext {
	public bot: NeedleBot;
	public interaction: ValidChatInputCommandInteraction;
	// TODO: Message context?

	constructor(bot: NeedleBot, interaction: ValidChatInputCommandInteraction) {
		this.bot = bot;
		this.interaction = interaction;
	}
}
