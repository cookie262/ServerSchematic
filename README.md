# Discord Server Template Bot

A professional Discord bot for exporting and importing server structures (roles, channels, permissions) while maintaining compliance with Discord's Terms of Service.

## Features

- **Server Export**: Save server structure including roles, channels, and permission overwrites
- **Server Import**: Recreate server structures from saved templates
- **Interactive UI**: Modern Discord embeds with dropdowns and buttons
- **Permission Checks**: Ensures users have proper permissions before actions
- **Rate Limiting**: Prevents abuse with cooldowns
- **Progress Updates**: Real-time feedback during import operations
- **Logging**: Comprehensive logging system for debugging and monitoring

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/discord-server-template-bot.git
   cd discord-server-template-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Fill in your bot token and other configuration in `.env`

5. Run the bot:
   ```bash
   npm start
   ```

## Configuration

Edit the `.env` file with the following variables:

- `DISCORD_TOKEN`: Your Discord bot token
- `BOT_OWNER_ID`: Your Discord user ID (for admin commands)
- `LOG_LEVEL`: Logging level (info, warn, error)
- `COMMAND_COOLDOWN`: Cooldown between commands in seconds

## Usage

1. Invite the bot to your server with the following permissions:
   - Manage Roles
   - Manage Channels
   - View Channels
   - Send Messages
   - Use Slash Commands

2. Use the `/template` command to open the template management interface

3. Choose to export your current server or import a saved template

## Bot Permissions Required

The bot requires the following permissions to function properly:

- Manage Roles
- Manage Channels
- View Channels
- Send Messages
- Embed Links
- Use Slash Commands

## Project Structure

```
discord-server-template-bot/
├── src/
│   ├── commands/
│   │   └── template.js
│   ├── events/
│   │   ├── interactionCreate.js
│   │   └── ready.js
│   ├── handlers/
│   │   └── uiHandler.js
│   ├── managers/
│   │   ├── exportManager.js
│   │   └── importManager.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── permissionMapper.js
│   │   └── rateLimiter.js
│   └── index.js
├── exports/
│   └── (saved templates)
├── logs/
│   ├── combined.log
│   └── error.log
├── .env
├── .env.example
├── package.json
└── README.md
```

## Compliance

This bot is designed to comply with Discord's Terms of Service:

- Only exports/imports server structure data
- Does not copy server names, icons, descriptions, or member data
- Does not scrape or store user messages
- Requires explicit user consent for all operations
- Only operates on servers where the user has appropriate permissions

## Development

To run in development mode with auto-restart:

```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions, please open an issue on GitHub or contact the maintainers.
