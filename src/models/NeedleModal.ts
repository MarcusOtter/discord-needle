import { ChatInputCommandInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
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

	public async openAndAwaitSubmit(interaction: ModalOpenableInteraction): Promise<ModalSubmitInteraction> {
		await interaction.showModal(this.builder);
		return interaction.awaitModalSubmit({
			time: 1000 * 60 * 15, // 15 min
			filter: x => x.customId === this.customId && x.user.id === interaction.user.id,
		});
	}
}

type ModalOpenableInteraction = GuildInteraction & ChatInputCommandInteraction;
