# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Needle is a Discord bot that automatically creates threads in configured channels. It's written in TypeScript using discord.js and follows an ES modules pattern with strict type checking.

## Development Commands

### Building and Running

- `npm run build` - Compile TypeScript to JavaScript (output: `dist/`)
- `npm start` - Build and run the bot
- `npm run deploy` - Deploy slash commands to Discord (required after command changes)
- `npm run undeploy` - Remove slash commands from Discord

### Code Quality

- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run prettier` - Run Prettier checks
- `npm run prettier:fix` - Auto-fix Prettier issues
- `npm run tsc` - Run TypeScript type checks

### Environment Setup

Copy `.env.example` to `.env` and configure:

- `DISCORD_API_TOKEN` - Bot token from Discord Developer Portal
- `CONFIGS_PATH` - Optional path for per-guild config files (defaults to `./configs`)

## Architecture

### Dependency Injection Pattern

The bot uses **ObjectFactory** (composition root) for dependency management:

- Creates all services and passes dependencies via constructor injection
- Acts as a Service Locator for commands, buttons, modals, and event listeners
- Central `NeedleBot` instance coordinates all bot operations

### Core Components

**NeedleBot** (`src/NeedleBot.ts`)

- Main bot orchestrator wrapping the Discord client
- Manages dynamic imports of commands, buttons, modals, and event listeners
- Provides centralized error handling and logging
- Public API for retrieving commands, buttons, and modals by name/ID

**ConfigService** (`src/services/ConfigService.ts`)

- Per-guild configuration stored as JSON files in `./configs/` directory
- File-based persistence using guild ID as filename (e.g., `123456789.json`)
- In-memory caching for performance
- Merges guild-specific settings with defaults from `NeedleConfig.defaultConfig`

**ThreadCreationService** (`src/services/ThreadCreationService.ts`)

- Core business logic for automatic thread creation
- Handles thread naming with regex support and variable replacement
- Manages thread reply messages, buttons, and status reactions
- Cooldown enforcement via `CooldownService` for Discord rate limiting

### Dynamic Import System

Commands, buttons, modals, and event listeners are discovered at runtime:

- **Commands** (`src/commands/*.ts`) - Extend `NeedleCommand`, registered as slash commands
- **Buttons** (`src/buttons/*.ts`) - Extend `NeedleButton`, handle button interactions
- **Modals** (`src/modals/*.ts`) - Extend `NeedleModal`, handle modal submissions
- **Event Listeners** (`src/eventListeners/*.ts`) - Extend `NeedleEventListener`, respond to Discord events

Each type is dynamically imported by its respective `DynamicImportService` which scans directories and instantiates classes as needed.

### File Naming Conventions

- Commands use kebab-case (e.g., `auto-thread.ts`)
- Custom IDs for buttons/modals should match their filename
- Event listener names must match Discord.js event names (e.g., `messageCreate`)

### Configuration Storage

Guild configs are JSON files containing:

- `threadChannels[]` - Array of `AutothreadChannelConfig` defining per-channel auto-thread rules
- `settings{}` - Overrides for default messages and emojis
- Only non-default values are persisted to reduce file size

## Key Patterns

### Adding a New Command

1. Create `src/commands/command-name.ts` extending `NeedleCommand`
2. Define `name`, `description`, `category` properties
3. Implement `execute(context: InteractionContext)` method
4. Optional: Add `addOptions(builder)` for slash command parameters
5. Optional: Set `defaultPermissions` for permission requirements
6. Run `npm run deploy` to register with Discord

### Adding a New Event Listener

1. Create `src/eventListeners/eventName.ts` extending `NeedleEventListener`
2. Set `name` to Discord.js event name (e.g., `"messageCreate"`)
3. Set `runType` to `ListenerRunType.EveryTime` or `ListenerRunType.OnlyOnce`
4. Implement `handle(args: ClientEvents[EventName])` method
5. Restart bot to load the new listener

### Variable Replacement System

The `MessageVariables` class provides template variable replacement:

- `$USER_MENTION`, `$USER_NICKNAME`, `$CHANNEL_MENTION`, etc.
- Used in thread titles, reply messages, and button labels
- Supports regex extraction with `$REGEXRESULT` placeholder

## Code Style

- ESLint config requires double quotes, enforces strict equality (`===`)
- No console logging restrictions - use freely for debugging
- TypeScript strict mode enabled with null checks
- Max 4 nested callbacks, max 2 statements per line
- Prefer `const` over `let`, no `var` allowed

## Discord.js Specifics

### Permission Handling

- Bot requires: View Channels, Send Messages, Send Messages in Threads, Create Public Threads, Read Message History
- Commands check both bot and user permissions via `hasPermissionToExecuteHere()`
- Permission overrides support per-guild, per-channel, per-role, and per-user configurations

### Memory Optimization

The bot uses aggressive caching limits (see `ObjectFactory.createDiscordClient()`):

- Most managers limited to <5 cached items per guild
- 10-minute sweep intervals to clear old cache entries
- Essential for bots in many servers to prevent memory issues

### Rate Limiting

Thread rename operations are rate-limited by Discord (2 renames per 10 minutes):

- Tracked by `CooldownService` to prevent API errors
- Always check `bot.isAllowedToRename(threadId)` before renaming
