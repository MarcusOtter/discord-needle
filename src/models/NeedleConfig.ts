// TODO: Add license comments

import AutothreadChannelConfig from "./AutothreadChannelConfig";
import Setting from "./enums/Setting";

export default interface NeedleConfig {
	threadChannels: AutothreadChannelConfig[];
	settings: {
		[K in SettingKeys]: string;
	};
}

type SettingKeys = keyof typeof Setting;
