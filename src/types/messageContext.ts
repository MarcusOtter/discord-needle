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

import { CacheType, Interaction, Message, TextBasedChannel, User } from "discord.js";

export interface MessageContext {
	interaction?: Interaction<CacheType>;
	message?: Message;

	// Variables that can be used in messages (if they exist at the time of invocation)
	// To use in message configuration, prefix with $ and convert name to SCREAMING_SNAKE_CASE
	// For example, $TIME_AGO and $USER
	channel?: TextBasedChannel;
	user?: User;
	timeAgo?: string;
}
