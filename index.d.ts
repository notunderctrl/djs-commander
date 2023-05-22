import { Client, APIApplicationCommand } from 'discord.js';
import { Logger } from 'winston';

class CommandHandler {
  constructor(options: CommandHandlerOptions);
  public get commands(): LocalCommand[];
}

interface CommandHandlerOptions {
  client: Client;
  commandsPath?: string;
  eventsPath?: string;
  validationsPath?: string;
  testServer?: string;
  logger?: Logger;
}

interface LocalCommand extends APIApplicationCommand {
  deleted?: boolean;
  [key: string]: any;
}

export { CommandHandler, LocalCommand };
