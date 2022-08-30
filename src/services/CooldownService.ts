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

export default class CooldownService {
	private readonly maxThreadRenamesPer10Minutes = 2;

	private threadCooldowns = new Map<string, number>();

	public reportThreadRenamed(threadId: string) {
		const renamesPast10Minutes = this.threadCooldowns.get(threadId) ?? 0;
		this.threadCooldowns.set(threadId, renamesPast10Minutes + 1);

		setTimeout(() => this.decreaseCounter(threadId), 1000 * 60 * 10);
	}

	public willBeRateLimited(threadId: string) {
		return (this.threadCooldowns.get(threadId) ?? 0) >= this.maxThreadRenamesPer10Minutes;
	}

	private decreaseCounter(threadId: string) {
		const renamesPast10Minutes = this.threadCooldowns.get(threadId) ?? 0;
		const newCooldownValue = renamesPast10Minutes - 1;

		if (newCooldownValue === 0) {
			this.threadCooldowns.delete(threadId);
			return;
		}

		this.threadCooldowns.set(threadId, newCooldownValue);
	}
}
