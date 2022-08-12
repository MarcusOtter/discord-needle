import type { SlashCommandBuilder } from "discord.js";

export type Nullish<T> = T | null | undefined;
export type Overwrite<T, U> = Omit<T, keyof U> & U;

export type SlashCommandBuilderWithOptions = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export type Newable = abstract new (...args: never[]) => unknown;
export type Concretize<T extends Newable> = new (...args: ConstructorParameters<T>) => InstanceType<T>;

export type ImportedClass<T extends Newable> = {
	fileName: string;
	Class: Concretize<T>;
};
