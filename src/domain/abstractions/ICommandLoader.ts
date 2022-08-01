import NeedleCommand from "../models/NeedleCommand";

export default interface ICommandLoader {
	loadCommands(skipCache?: boolean): Promise<NeedleCommand[]>;
}
