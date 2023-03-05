import { Client } from 'discord.js';

class CommandHandler {
  constructor({
    client,
    commandsPath,
    eventsPath,
    validationsPath,
    testServer,
  }: {
    client: Client;
    commandsPath?: string;
    eventsPath?: string;
    validationsPath?: string;
    testServer?: string;
  });
}

export { CommandHandler };
