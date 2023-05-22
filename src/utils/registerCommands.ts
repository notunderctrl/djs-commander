import { Client } from 'discord.js';
import { Logger } from 'winston';
import { LocalCommand } from '../dev';
import { getAppCommands } from './getAppCommands';
import { areCommandsDifferent } from './areCommandsDifferent';

export async function registerCommands({
  client,
  commands: localCommands,
  testServer,
  logger,
}: {
  client: Client;
  commands: LocalCommand[];
  testServer?: string;
  logger?: Logger;
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

    const existingCommand = applicationCommands.cache.find(
      (cmd: any) => cmd.name === name
    );

    if (existingCommand) {
      if (localCommand.deleted) {
        await applicationCommands.delete(existingCommand.id);
        let message = `🗑 Deleted command "${name}".`;
        if (logger) logger.info(message);
        else console.log(message);

        continue;
      }

      if (areCommandsDifferent(existingCommand, localCommand)) {
        await applicationCommands.edit(existingCommand.id, {
          description,
          options,
        });

        let message = `🔁 Edited command "${name}".`;
        if (logger) logger.info(message);
        else console.log(message);
      }
    } else {
      if (localCommand.deleted) {
        let message = `⏩ Skipping registering command "${name}" as it's set to delete.`;
        if (logger) logger.info(message);
        else console.log(message);
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

      let message = `👍 Registered command "${name}".`;
      if (logger) logger.info(message);
      else console.log(message);
    }
  }
}
