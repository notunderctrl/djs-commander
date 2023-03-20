import { Client } from 'discord.js';

export async function getAppCommands(client: Client, guildId?: string) {
  let applicationCommands;

  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    applicationCommands = await guild.commands.fetch();
  } else {
    applicationCommands = await client.application?.commands.fetch();
  }

  return applicationCommands;
}
