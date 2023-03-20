import { Client } from 'discord.js';
import { LocalCommand } from '../dev';
import { getAppCommands } from './getAppCommands';
import { areCommandsDifferent } from './areCommandsDifferent';

export async function registerCommands({
  client,
  commands: localCommands,
  testServer,
}: {
  client: Client;
  commands: LocalCommand[];
  testServer?: string;
}) {
  const applicationCommands = (await getAppCommands(client, testServer)) as any;

  for (const localCommand of localCommands) {
    const {
      name,
      name_localizations,
      description,
      description_localizations,
      default_member_permissions,
      dm_permission,
      options,
    } = localCommand;

    const existingCommand = await applicationCommands.cache.find((cmd: any) => cmd.name === name);

    if (existingCommand) {
      if (localCommand.deleted) {
        await applicationCommands.delete(existingCommand.id);
        console.log(`🗑 Deleted command "${name}".`);
        continue;
      }

      if (areCommandsDifferent(existingCommand, localCommand)) {
        await applicationCommands.edit(existingCommand.id, {
          description,
          options,
        });

        console.log(`🔁 Edited command "${name}".`);
      }
    } else {
      if (localCommand.deleted) {
        console.log(`⏩ Skipping registering command "${name}" as it's set to delete.`);
        continue;
      }

      await applicationCommands.create({
        name,
        name_localizations,
        description,
        description_localizations,
        default_member_permissions,
        dm_permission,
        options,
      });

      console.log(`👍 Registered command "${name}."`);
    }
  }
}
