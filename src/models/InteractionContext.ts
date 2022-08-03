import type NeedleBot from "../NeedleBot";
import type { ValidCommandInteraction } from "../validators/InteractionValidator";

export default class InteractionContext {
	public bot: NeedleBot;
	public interaction: ValidCommandInteraction;
	// TODO: Message context?

	constructor(bot: NeedleBot, interaction: ValidCommandInteraction) {
		this.bot = bot;
		this.interaction = interaction;
	}
}
