import { promises } from "fs";

export async function importJsFilesInDirectory<T>(directoryPath: string): Promise<T[]> {
	const allFileNames = await promises.readdir(directoryPath);
	const jsFileNames = allFileNames.filter(file => file.endsWith(".js"));

	const modules = [];
	for (const file of jsFileNames) {
		const module = (await import(`${directoryPath}/${file}`)) as T;
		modules.push(module);
	}

	return modules;
}
