<div align="center">
   <h1>
      <sub>
         <a href="#"><img src="https://raw.githubusercontent.com/MarcusOtter/discord-needle/main/branding/logo-64x64.png" height="39" width="39"></a>
      </sub>
      Needle
   </h1>
   Needle is a <b><a href="https://discord.com/">Discord</a> bot</b> that helps you declutter your server by creating <a href="https://support.discord.com/hc/en-us/articles/4403205878423-Threads-FAQ">Discord threads</a> automatically.
   <br/><br/>
   <a href="https://needle.gg">Website ✨</a> &emsp; <a href="https://needle.gg/invite">Invite Needle 🪡</a> &emsp; <a href="https://needle.gg/chat">Get support 💬</a>
</div>

## Self-hosting (advanced)

Needle requires an environment with Node.js version `16.9.0` or higher, along with persistent storage for per-server config files - shared hosts (like Replit and Heroku) will not work.

1. Download the [latest release](https://github.com/MarcusOtter/discord-needle/releases/latest) of Needle and extract the archive.
2. Copy `.env.example` to `.env` and fill in your bot's token and application ID.
3. Run `npm install` to install Needle's dependencies.
4. Run `npm run build` to compile Needle's code.
5. Run `npm run deploy` to setup Slash Commands.
    - Slash Commands can take up to one hour to fully roll out.
6. Run `npm start` to start Needle :tada:.

Needle requires the following permissions to function, along with the `applications.commands` and `bot` scopes.

-   [x] View channels
-   [x] Send messages
-   [x] Send messages in threads
-   [x] Create public threads
-   [x] Read message history

You can use this link to invite Needle, replacing `<APP ID>` with your bot's application ID.

```
https://discord.com/oauth2/authorize?client_id=<APP ID>&permissions=309237713920&scope=bot%20applications.commands
```

### 🐳 Docker

Needle has an [official Docker image](https://github.com/MarcusOtter/discord-needle/pkgs/container/discord-needle). Releases are tagged by their minor & patch version (eg. `2.0.0` & `2.0`), with the latest release tagged `latest`. Branches are tagged by their name.

```sh
docker run -d --name Needle --env=DISCORD_API_TOKEN=token discord-needle ghcr.io/MarcusOtter/discord-needle:latest
```

<sub>Replace `token` with your bot's token.</sub>

By default, this will create an anonymous volume for `/configs`. To change the location, add `-v /path/to/configs:/configs` to the command.

There is also an [example `docker-compose.yml` file](https://raw.githubusercontent.com/MarcusOtter/discord-needle/main/docker-compose.yml).

You'll still need to deploy Needle's slash commands - follow the regular self-hosting instructions apart from step 6.

## 🤝 Contributing

Coming soon :tm:

[Join the Discord](https://needle.gg/chat) if interested!

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
