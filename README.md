# discord-auto-threader
A discord bot that makes a new thread for every message in certain channels.

## How to run the bot
1. Edit the `src/config.json` with API token and the IDs of the channels you want to thread every message in:
    ```json
    {
        "discordApiToken": "INSERT TOKEN HERE",
        "threadChannels": [
            "123456789123456789",
            "987654321987654321"
        ]
    }
    ```
2. Run `npm install`
3. Run `npm start`
