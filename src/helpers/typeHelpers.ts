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

import type { SlashCommandBuilder } from "discord.js";

export type Nullish<T> = T | null | undefined;
export type Overwrite<T, U> = Omit<T, keyof U> & U;

export type SlashCommandBuilderWithOptions = Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

export type Newable = abstract new (...args: never[]) => unknown;
export type Concretize<T extends Newable> = new (...args: ConstructorParameters<T>) => InstanceType<T>;

export type SameLengthTuple<TTuple, TType> = { [I in keyof TTuple]: TType };

export type ImportedClass<T extends Newable> = {
	fileName: string;
	Class: Concretize<T>;
};
