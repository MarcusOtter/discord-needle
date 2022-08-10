import {
	ChannelType,
	ChatInputCommandInteraction,
	GuildMember,
	PermissionsBitField,
	PublicThreadChannel,
	RESTPostAPIApplicationCommandsJSONBody,
	SlashCommandBuilder,
} from "discord.js";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class TitleCommand extends NeedleCommand {
	public async getBuilder(): Promise<RESTPostAPIApplicationCommandsJSONBody> {
		return new SlashCommandBuilder()
			.setName("title")
			.setDescription("Sets the title of a thread")
			.addStringOption(option => {
				return option.setName("value").setDescription("The new title of the thread").setRequired(true);
			})
			.toJSON();
	}

	public async onExecuted({ interaction, messages, getThreadAuthor }: InteractionContext): Promise<void> {
		const { channel, member } = interaction;

		// TODO: I want to get rid of annoying validation like this and move it further up
		if (!(member instanceof GuildMember) || !interaction.isChatInputCommand()) {
			await interaction.reply({ content: messages.ERR_UNKNOWN, ephemeral: true });
			return;
		}

		// TODO: Add some meta info to commands that says this has to be in a thread,
		// and if not, it should be handled by the CommandExecutorService or something
		if (channel?.type !== ChannelType.GuildPublicThread) {
			await interaction.reply({ content: messages.ERR_ONLY_IN_THREAD, ephemeral: true });
			return;
		}

		const newThreadName = interaction.options.getString("value", true);
		const oldThreadName = channel.name;
		if (oldThreadName === newThreadName) {
			await interaction.reply({ content: messages.ERR_NO_EFFECT, ephemeral: true });
			return;
		}

		const hasChangeTitlePermissions = member
			.permissionsIn(channel)
			.has(PermissionsBitField.Flags.ManageThreads, true);

		if (hasChangeTitlePermissions) {
			return this.setTitle(channel, newThreadName, interaction);
		}

		// TODO: Check if WE have permission to set the title (duh, why isn't this done already)

		const threadAuthor = await getThreadAuthor();
		if (!threadAuthor) {
			await interaction.reply({ content: messages.ERR_AMBIGUOUS_THREAD_AUTHOR, ephemeral: true });
			return;
		}

		if (threadAuthor !== interaction.user) {
			await interaction.reply({ content: messages.ERR_ONLY_THREAD_OWNER, ephemeral: true });
			return;
		}

		await this.setTitle(channel, newThreadName, interaction);
	}

	private async setTitle(
		thread: PublicThreadChannel,
		title: string,
		interaction: ChatInputCommandInteraction
	): Promise<void> {
		await thread.setName(title);
		await interaction.reply({ content: "Success!", ephemeral: true });
	}
}
