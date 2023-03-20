import { Client, APIApplicationCommand } from 'discord.js';

interface CommandHandlerOptions {
  client: Client;
  commandsPath?: string;
  eventsPath?: string;
  validationsPath?: string;
  testServer?: string;
}

class CommandHandler {
  constructor(options: CommandHandlerOptions);
}

interface LocalCommand extends APIApplicationCommand {
  deleted?: boolean;
  [key: string]: any;
}

export { CommandHandler, LocalCommand };
