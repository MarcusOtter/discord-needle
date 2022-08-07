import { promises, existsSync } from "fs";
import { resolve as pathResolve } from "path";

export default class DynamicImportService<T extends Newable> {
	private readonly directoryPath: string;

	private cache: ImportedClass<T>[] = [];

	constructor(directoryPath: string) {
		this.directoryPath = pathResolve(__dirname, directoryPath);
	}

	public async load(skipCache = false): Promise<ImportedClass<T>[]> {
		if (!skipCache && this.cache.length > 0) return this.cache;

		this.cache = await this.importClassesInDirectory(this.directoryPath);
		return this.cache;
	}

	public get(name: string): Concretize<T> | undefined {
		return this.cache.find(x => x.fileName === name)?.Class;
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
					Class: (await import(`${directoryPath}/${fileName}`)).default,
				} as ImportedClass<T>;
			})
		);
	}
}

type Newable = abstract new (...args: never[]) => unknown;
type Concretize<T extends Newable> = new (...args: ConstructorParameters<T>) => InstanceType<T>;
type ImportedClass<T extends Newable> = {
	fileName: string;
	Class: Concretize<T>;
};
