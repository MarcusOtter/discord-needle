enum ChannelType {
	Thread = 1 << 0,
	DirectMessage = 1 << 1,
	GuildText = 1 << 2,
	Any = ~(~0 << 3),
}

export default ChannelType;
