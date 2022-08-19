import { ButtonInteraction, ChatInputCommandInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { Nullish } from "../helpers/typeHelpers";
import NeedleBot from "../NeedleBot";
import InteractionContext, { GuildInteraction } from "./InteractionContext";

export default abstract class NeedleModal {
	public abstract readonly customId: string;
	public abstract readonly builder: ModalBuilder;

	protected readonly bot: NeedleBot;

	constructor(bot: NeedleBot) {
		this.bot = bot;
	}

	public abstract submit(context: InteractionContext): Promise<void>;

	public async openAndAwaitSubmit(
		interaction: ModalOpenableInteraction,
		firstTextInputValue: Nullish<string> = undefined
	): Promise<ModalSubmitInteraction> {
		let builder = this.builder;
		if (firstTextInputValue) {
			const row = this.builder.components[0];
			const firstComponent = row.components[0];
			builder = this.builder.setComponents(row.setComponents(firstComponent.setValue(firstTextInputValue)));
		}

		await interaction.showModal(builder);
		return interaction.awaitModalSubmit({
			time: 1000 * 60 * 15, // 15 min
			filter: x => x.customId === this.customId && x.user.id === interaction.user.id,
		});
	}
}

export type ModalOpenableInteraction = GuildInteraction & (ChatInputCommandInteraction | ButtonInteraction);
