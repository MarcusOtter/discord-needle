import { ClientEvents } from "discord.js";
import { promises } from "fs";
import NeedleCommand from "../models/NeedleCommand";
import NeedleEventListener from "../models/NeedleEventListener";
import type NeedleBot from "../NeedleBot";

// The files need to have a CLASS AS DEFAULT EXPORT !!!
// This is a really ugly method

export async function importJsFilesInDirectory<T>(directoryPath: string, bot: NeedleBot): Promise<Map<string, T>> {
	const allFileNames = await promises.readdir(directoryPath);
	const jsFileNames = allFileNames.filter(file => file.endsWith(".js"));

	const outputMap = new Map<string, T>();
	for (const fileName of jsFileNames) {
		const ImportedClass = (await import(`${directoryPath}/${fileName}`)).default as ClassOf<T>;
		const fileNameWithoutExtension = fileName.split(".")[0] as keyof ClientEvents;

		let obj;
		console.dir(fileName);
		console.dir(ImportedClass);
		if (ImportedClass.prototype instanceof NeedleEventListener) {
			obj = new ImportedClass(bot, fileNameWithoutExtension);
		} else if (ImportedClass.prototype instanceof NeedleCommand) {
			obj = new ImportedClass(bot);
		}

		if (!obj) throw new Error(`${fileName} did not have an event class or command class as its default export`);

		outputMap.set(fileNameWithoutExtension, obj);
	}

	return outputMap;
}

type ClassOf<T> = new (...args: Params) => T;

type AbstractConstructorHelper<T> = (new (...args: unknown[]) => { [x: string]: unknown }) & T;
type AbstractContructorParameters<T> = ConstructorParameters<AbstractConstructorHelper<T>>;

type Params = AbstractContructorParameters<typeof NeedleEventListener | typeof NeedleCommand>;
