export function plural(word: string, count: number) {
	const output = `${count} ${word}`;
	return count === 1 ? output : `${output}s`;
}
