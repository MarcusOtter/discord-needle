import { ButtonBuilder, ButtonStyle } from "discord.js";
import NeedleButton from "../models/NeedleButton";

export default class BugReportButton extends NeedleButton {
	public async getBuilder(): Promise<ButtonBuilder> {
		return new ButtonBuilder()
			.setLabel("Report a bug")
			.setStyle(ButtonStyle.Link)
			.setURL("https://github.com/MarcusOtter/discord-needle/issues/new/choose")
			.setEmoji("🐛");
	}

	public async onPressed(): Promise<void> {
		// Do nothing, links open automatically
	}
}
