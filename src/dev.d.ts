import { Client, APIApplicationCommand, SlashCommandBuilder } from 'discord.js';

interface LocalCommand extends APIApplicationCommand {
  deleted?: boolean;
  [key: string]: any;
}
