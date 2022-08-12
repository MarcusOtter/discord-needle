import { ButtonBuilder, ButtonStyle } from "discord.js";
import NeedleButton from "../models/NeedleButton";

export default class GithubRepoButton extends NeedleButton {
	public async getBuilder(): Promise<ButtonBuilder> {
		return new ButtonBuilder()
			.setLabel("Source code")
			.setStyle(ButtonStyle.Link)
			.setURL("https://needle.gg/github")
			.setEmoji("930584823473516564"); // :discord_light:
	}

	public async press(): Promise<void> {
		// Do nothing, links open automatically
	}
}
