import { resolve as resolvePath } from "path";

export default class ConfigService {
	private readonly directoryPath: string;

	constructor(directoryPath: string) {
		this.directoryPath = resolvePath(__dirname, "../../", process.env.CONFIGS_PATH || directoryPath);
	}
}
