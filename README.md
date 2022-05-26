<div align="center">
	<h1>
		<sub>
			<a href="#">
				<img
					src="https://raw.githubusercontent.com/MarcusOtter/discord-needle/main/branding/logo-64x64.png"
					height="39"
					width="39"
				/>
			</a>
		</sub>
		Needle
	</h1>
	Needle is a <b><a href="https://discord.com/">Discord</a> bot</b> that helps you declutter your server by creating <a href="https://support.discord.com/hc/en-us/articles/4403205878423-Threads-FAQ">Discord threads</a> automatically.
	<br /><br />
	<a href="https://needle.gg"><img src="https://img.shields.io/badge/🌐_Website-gray?style=for-the-badge" alt="Website" /></a>
	&emsp;
	<a href="https://needle.gg/invite"><img src="https://img.shields.io/badge/💌_Invite%20Needle-gray?style=for-the-badge" alt="Invite Needle" /></a>
	&emsp;
	<a href="https://needle.gg/chat"><img src="https://img.shields.io/badge/🙋_Get%20Support-gray?style=for-the-badge" alt="Get Support" /></a>
</div>

## 👋 Getting started

The easiest way to start using Needle in your server is to use the hosted instance. [Click here to invite Needle](https://needle.gg/invite) to your Discord server! If you have any questions, feel free to join the [support server](https://needle.gg/chat) and check the [Frequently Asked Questions](https://needle.gg/faq).

## 🛠️ Self-hosting (advanced)

The hosted instance of Needle is customizeable and should be enough for most users. However, if you have special requirements and want to modify the functionality of Needle, you will have to fork the repository and self-host your own instance. This requires programming knowledge and is only for advanced users - support for this will be limited.

Needle requires an environment with Node.js version `16.9.0` or higher, along with persistent storage for per-server config files - shared hosts (like Replit and Heroku) will not work.

1. Clone or download the [latest release](https://github.com/MarcusOtter/discord-needle/releases/latest) of Needle (branch: [`stable`](https://github.com/MarcusOtter/discord-needle/tree/stable)).
2. Copy `.env.example` to `.env` and fill in your bot's token and application ID.
3. Run `npm install` to install Needle's dependencies.
4. Run `npm run build` to compile Needle's code.
5. Run `npm run deploy` to setup slash commands.
    - Slash commands can take **up to one hour** to show up in all servers.
6. Run `npm start` to start Needle :tada:

Needle requires the following permissions to function, along with the `applications.commands` and `bot` scopes.

-   [x] View channels
-   [x] Send messages
-   [x] Send messages in threads
-   [x] Create public threads
-   [x] Read message history

You can use this link to invite your self-hosted version of Needle, replacing `<APP ID>` with your bot's application ID:

```
https://discord.com/oauth2/authorize?client_id=<APP ID>&permissions=309237713920&scope=bot%20applications.commands
```

### 🐳 Docker

Needle has an [official Docker image](https://github.com/MarcusOtter/discord-needle/pkgs/container/discord-needle). Releases are tagged by their minor & patch version (e.g. `2.0.0` & `2.0`), with the latest release tagged `latest`. Branches are tagged by their name. To run the image, write the following command, replacing `token` with your bot's token:

```sh
docker run -d --name Needle --env DISCORD_API_TOKEN=token discord-needle ghcr.io/MarcusOtter/discord-needle:latest
```

By default, this will create an anonymous volume for `/configs`. To change the location, add `-v /path/to/configs:/configs` to the command.

There is also an [example `docker-compose.yml` file](https://github.com/MarcusOtter/discord-needle/blob/main/docker-compose.yml).

You'll still need to deploy Needle's slash commands - follow the regular self-hosting instructions apart from step 6.

## 🤝 Contributing

Contribution guidelines coming soon :tm:

[Join the Discord](https://needle.gg/chat) if interested!

If you want to support Needle in other ways, consider [sponsoring](https://needle.gg/sponsor) the development of Needle.

You can also [vote for and review the bot on top.gg](https://needle.gg/vote).

## 📜 License

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at
your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
