/*
This file is part of Needle.

Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
Affero General Public License as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with Needle.
If not, see <https://www.gnu.org/licenses/>.
*/

import type { ClientEvents } from "discord.js";
import type NeedleBot from "../NeedleBot.js";
import type ListenerRunType from "./enums/ListenerRunType.js";

export default abstract class NeedleEventListener {
	public abstract readonly name: keyof ClientEvents;
	public abstract readonly runType: ListenerRunType;
	protected readonly bot: NeedleBot;

	constructor(bot: NeedleBot) {
		this.bot = bot;
	}

	public abstract handle(args: ClientEvents[keyof ClientEvents]): Promise<void>;
}
