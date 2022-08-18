import { Nullish } from "./typeHelpers";

export function plural(word: string, count: number) {
	const output = `${count} ${word}`;
	return count === 1 ? output : `${output}s`;
}

export function hasUrl(input: string): boolean {
	return (input.match(/\b(https?):\/\/[^\s]+\.[^\s]+/gim)?.length ?? 0) > 0;
}

export function clampWithElipse(input: string, maxLength: number): string {
	return input.length > maxLength ? input.substring(0, maxLength - 3) + "..." : input;
}

// https://github.com/discord/discord-api-docs/discussions/5338#discussioncomment-3411282
export function removeInvalidThreadNameChars(input: Nullish<string>): string {
	return input?.replaceAll(/[<>/\\:#@"]/gi, "").trim() ?? "";
}

export function extractRegex(input: string): { inputWithRegexVariable: string; regex?: RegExp } {
	const match = input.match(/^.*(\/(.*)\/(\w*)).*$/);
	if (match && match.length > 2) {
		return {
			inputWithRegexVariable: input.replace(match[1], "$REGEXRESULT"),
			regex: new RegExp(match[2], match[3]),
		};
	}

	return { inputWithRegexVariable: input };
}
