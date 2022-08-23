import { ButtonInteraction, ChatInputCommandInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import NeedleBot from "../NeedleBot";
import InteractionContext, { GuildInteraction } from "./InteractionContext";
import { ModalTextInput } from "./ModalTextInput";

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
		defaultValues: ModalTextInput[]
	): Promise<ModalSubmitInteraction> {
		const builder = this.builder;
		builder.setComponents(
			builder.components.map(row =>
				row.setComponents(
					row.components[0].setValue(
						defaultValues.find(s => s.customId === row.components[0].data.custom_id)?.value ?? ""
					)
				)
			)
		);

		await interaction.showModal(builder);
		return interaction.awaitModalSubmit({
			time: 1000 * 60 * 15, // 15 min
			filter: x => x.customId === this.customId && x.user.id === interaction.user.id,
		});
	}
}

export type ModalOpenableInteraction = GuildInteraction & (ChatInputCommandInteraction | ButtonInteraction);
