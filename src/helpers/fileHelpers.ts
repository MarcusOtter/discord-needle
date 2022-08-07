import { promises } from "fs";

// The imported files need to have a CLASS AS DEFAULT EXPORT !!!
export async function importClassesInDirectory<T extends Newable>(directoryPath: string): Promise<ImportedClass<T>[]> {
	const allFileNames = await promises.readdir(directoryPath);
	const jsFileNames = allFileNames.filter(file => file.endsWith(".js"));

	return Promise.all(
		jsFileNames.map(async fileName => {
			return {
				fileName: fileName.split(".")[0],
				fileType: fileName.split(".")[1],
				Class: (await import(`${directoryPath}/${fileName}`)).default,
			} as ImportedClass<T>;
		})
	);
}

type Newable = abstract new (...args: never[]) => unknown;
type Concretize<T extends Newable> = new (...args: ConstructorParameters<T>) => InstanceType<T>;

type ImportedClass<T extends Newable> = {
	fileName: string;
	fileType: string;
	Class: Concretize<T>;
};
