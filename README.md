# discord-auto-threader
A discord bot that makes a new thread for every message in certain channels.
| Message | Thread |
| ------------- | - |
| ![image](https://user-images.githubusercontent.com/35617441/130550016-02ef9479-342f-4cc0-b1d1-3de4f42a4c98.png) | ![image](https://user-images.githubusercontent.com/35617441/130549842-f046ba5a-311b-43c3-b3cd-aa2fd5642b35.png) |

## How to run the bot
1. Edit the `src/config/config.json` with API token and the IDs of the channels you want to thread every message in:
    ```json
    {
        "discordApiToken": "INSERT TOKEN HERE",
        "threadChannels": [
            "CHANNEL ID 1 HERE",
            "CHANNEL ID 2 HERE",
            "ETC"
        ]
    }
    ```
2. Run `npm install`
3. Run `npm start`
4. Make sure the bot has the required permissions in Discord. Depending on your [configuration](#configuration), these can be:
    - `USE_PUBLIC_THREADS` (always required)
    - `SEND_MESSAGES` (always required)
    - `READ_MESSAGE_HISTORY` (always required)
    - `EMBED_LINKS` (required if there are any [embeds](#embeds))
    - `MANAGE_MESSAGES` (required if [shouldPin](#shouldpin) is `true`)
5. Done! :tada:

## Configuration :construction: UNDER CONSTRUCTION, NOT WORKING YET :construction:
If you want to, you can configure how the bot reacts by editing the `src/config/config.json` file. Here are the default settings:
```json
"threadArchiveDurationInMinutes": "MAX",
"threadMessage": {
    "shouldSend": true,
    "shouldPin": true,
    "content": "Thread created from $$channelMention by $$authorMention $$relativeTimeSince with the following message:",
    "embeds": [
        "$$messageEmbed"
    ]
}
```
An explanation follows.

### threadArchiveDurationInMinutes
Determines the duration of inactivity that causes a thread to be automatically archived (by Discord). If your server's boost level is not high enough for the setting you choose, or if you leave it blank, it will default to `"MAX"`.

Allowed values:
- `60` (= 1hr)
- `1440` (= 1d)
- `4320` (= 3d) :warning: *only for servers with boost level 1 or higher*
- `10080` (= 1w) :warning: *only for servers with boost level 2 or higher*
- `"MAX"` (depends on the server's boost level)

### threadMessage
Settings regarding the message that is sent by the bot in the thread when it is created.

#### shouldSend
Whether or not to send a message. If you set this to `false`, the rest of these settings are ignored.

#### shouldPin
Whether or not to pin the message that was sent by the bot. If you set this to `false`, the bot does not need the `MANAGE_MESSAGES` permission.

#### content
The text content of the message that is sent. Available variables:
- `$$authorMention` - A mention of the author that sent the original message
- `$$channelMention` - A mention of the channel that the original message was sent in
- `$$relativeTimeSince` - A relative timestamp for when the original message was posted

#### embeds
An array of the embeds to attach to the message, with a maximum of 10. Available embeds:
- `$$messageEmbed` - A copy of the original message in embed format
