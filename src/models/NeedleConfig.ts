// TODO: Add license comments
// TODO: Remove "Needle" prefix for these types, kinda redundant

import AutothreadChannelConfig from "./AutothreadChannelConfig";
import Setting from "./enums/Setting";

export default interface NeedleConfig {
	threadChannels: AutothreadChannelConfig[];
	emojisEnabled: boolean; // TODO: Remove
	// Maybe it would be best if this had a get setting that took variables and did things
	// But this is also like just a type for the json so maybe methods are weird to have on it
	// Maybe we have no default json config at all
	settings: {
		[K in SettingKeys]: string;
	};
}

type SettingKeys = keyof typeof Setting;
