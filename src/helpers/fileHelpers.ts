import { ClientEvents } from "discord.js";
import { promises } from "fs";

// The files need to have a CLASS AS DEFAULT EXPORT !!!
export async function importClassesInDirectory<T extends Newable>(
	directoryPath: string
): Promise<Map<string, Concretize<T>>> {
	const allFileNames = await promises.readdir(directoryPath);
	const jsFileNames = allFileNames.filter(file => file.endsWith(".js"));

	const outputMap = new Map<string, Concretize<T>>();
	for (const fileName of jsFileNames) {
		const ImportedClass = (await import(`${directoryPath}/${fileName}`)).default as Concretize<T>;
		const fileNameWithoutExtension = fileName.split(".")[0] as keyof ClientEvents;
		outputMap.set(fileNameWithoutExtension, ImportedClass);
	}

	return outputMap;
}

type Newable = abstract new (...args: never[]) => unknown;
type Concretize<T extends Newable> = new (...args: ConstructorParameters<T>) => InstanceType<T>;
