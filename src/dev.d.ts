import { Client, APIApplicationCommand, SlashCommandBuilder } from 'discord.js';

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
