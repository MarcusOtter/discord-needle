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
