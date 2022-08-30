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

import { promises, existsSync } from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Concretize, ImportedClass, Newable } from "../helpers/typeHelpers.js";

export default class DynamicImportService<T extends Newable> {
	private readonly directoryPath: string;

	private cache: ImportedClass<T>[] = [];

	constructor(directoryPath: string) {
		const dirname = path.dirname(fileURLToPath(import.meta.url));
		this.directoryPath = path.join(dirname, "../" + directoryPath);
	}

	public async load(skipCache = false): Promise<ImportedClass<T>[]> {
		if (!skipCache && this.cache.length > 0) return this.cache;

		this.cache = await this.importClassesInDirectory(this.directoryPath);
		return this.cache;
	}

	public get(name: string): Concretize<T> {
		const output = this.cache.find(x => x.fileName === name)?.Class;
		if (!output) throw new Error(`Could not find ${name} in cache.`);
		return output;
	}

	private async importClassesInDirectory(directoryPath: string): Promise<ImportedClass<T>[]> {
		const folderExists = existsSync(directoryPath);
		if (!folderExists) {
			console.error("Could not find " + directoryPath);
			return [];
		}

		const allFileNames = await promises.readdir(directoryPath);
		const jsFileNames = allFileNames.filter(file => file.endsWith(".js"));

		return Promise.all(
			jsFileNames.map(async fileName => {
				return {
					fileName: fileName.split(".")[0],
					Class: (await import(`file://${directoryPath}/${fileName}`)).default,
				} as ImportedClass<T>;
			})
		);
	}
}
