

<div align="center">
   <h1>
      Needle
      <sub>
         <a href="#"><img src="https://raw.githubusercontent.com/MarcusOtter/discord-needle/main/branding/logo-64x64.png" height="39" width="39"></a>
      </sub>
   </h1>
   Needle is a <b><a href="https://discord.com/">Discord</a> bot</b> that helps you manage your <b><a href="https://support.discord.com/hc/en-us/articles/4403205878423-Threads-FAQ">Discord threads</a></b> 🪡
   <br/><br/>
   <table>
      <tr>
         <td><a href="https://needle.gg">Website ✨</a></td>
         <td><a href="https://needle.gg/invite">Invite Needle 🪡</a></td>
         <td><a href="https://needle.gg/chat">Get support 💬</a></td>
      </tr>
   </table>
</div>

## Self-hosting
This step-by-step guide assumes you have [NodeJS](https://nodejs.org/en/) version `16.6.0` or higher installed and that you have a Discord Bot user set up at [Discord's developer page](https://discord.com/developers/applications) that has been invited to your server with the `bot` scope and the `applications.commands` scope.

1. Clone the repository
2. Create a file named `.env`  in the root directory and insert the Discord API token for your bot:
   ```bash
   DISCORD_API_TOKEN=abcd1234...
   ```
3. Run `npm install`
4. Make sure the bot has the required permissions in Discord:
   - [x] View channels
   - [x] Send messages
   - [x] Send messages in threads
   - [x] Create public threads
   - [x] Read message history
5. Run `npm start`
6. Deploy! :tada:

## Contributing
Coming soon :tm:

[Join the Discord](https://needle.gg/chat) if interested!
