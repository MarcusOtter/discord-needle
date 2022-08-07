import { ValidChatInputCommandInteraction } from "../helpers/validationHelpers";
import type NeedleBot from "../NeedleBot";

export default class InteractionContext {
	public bot: NeedleBot;
	public interaction: ValidChatInputCommandInteraction;
	// TODO: Message context?

	constructor(bot: NeedleBot, interaction: ValidChatInputCommandInteraction) {
		this.bot = bot;
		this.interaction = interaction;
	}
}
