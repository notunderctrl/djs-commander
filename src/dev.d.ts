import { Client, APIApplicationCommand, SlashCommandBuilder } from 'discord.js';

interface CommandHandler {
  _client: Client;
  _commandsPath?: string;
  _eventsPath?: string;
  _validationsPath?: string;
  _testServer?: string;
  _commands: Array<object>;
  _commandsToRegister: Array<object>;
  _validationFuncs: Array<function>;
}

interface LocalCommand extends APIApplicationCommand {
  deleted?: boolean;
  [key: string]: any;
}

interface ApplicationCommandOption {
  type: number;
  name: string;
  description: string;
  required: boolean;
  choices: Array<ApplicationCommandOptionChoice>;
}

interface ApplicationCommandOptionChoice {
  name: string;
  value: string | number;
}
