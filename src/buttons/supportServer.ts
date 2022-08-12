import { ButtonBuilder, ButtonStyle } from "discord.js";
import NeedleButton from "../models/NeedleButton";

export default class SupportServerButton extends NeedleButton {
	public async getBuilder(): Promise<ButtonBuilder> {
		return new ButtonBuilder()
			.setLabel("Needle support")
			.setStyle(ButtonStyle.Link)
			.setURL("https://discord.gg/8BmnndXHp6")
			.setEmoji("930584823473516564"); // :discord_light:
	}

	public async press(): Promise<void> {
		// Do nothing, links open automatically
	}
}
