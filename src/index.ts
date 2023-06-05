import { Client } from 'discord.js';
import { Logger } from 'winston';
import { LocalCommand } from './dev';
import { getFolderPaths, getFilePaths } from './utils/getPaths';
import { buildCommandTree } from './utils/buildCommandTree';
import { registerCommands } from './utils/registerCommands';

export class CommandHandler {
  private readonly _client: Client;
  private readonly _commandsPath: string | undefined;
  private readonly _eventsPath: string | undefined;
  private readonly _commandValidationsPath: string | undefined;
  private readonly _eventValidationsPath: string | undefined;
  private readonly _testServer: string | undefined;
  private readonly _commandValidationFuncs: Array<Function>;
  private readonly _eventValidationFuncs: Map<String, Function[]>;
  private readonly _logger: Logger | undefined;
  private _commands: Array<LocalCommand>;

  constructor({
    client,
    commandsPath,
    eventsPath,
    commandValidationsPath,
    eventValidationsPath,
    testServer,
    logger,
  }: {
    client: Client;
    commandsPath?: string;
    eventsPath?: string;
    commandValidationsPath?: string;
    eventValidationsPath?: string;
    testServer?: string;
    logger?: Logger;
  }) {
    if (!client)
      throw new Error('Property "client" is required when instantiating CommandHandler.');

    this._client = client;
    this._commandsPath = commandsPath;
    this._eventsPath = eventsPath;
    this._commandValidationsPath = commandValidationsPath;
    this._eventValidationsPath = eventValidationsPath;
    this._testServer = testServer;
    this._commands = [];
    this._commandValidationFuncs = [];
    this._eventValidationFuncs = new Map<String, Function[]>();
    this._logger = logger;

    if (this._commandValidationsPath && !commandsPath) {
      throw new Error(
        'Command validations are only available in the presence of a commands path. Either add "commandsPath" or remove "commandValidationsPath"'
      );
    }

    if (this._eventValidationsPath && !eventsPath) {
      throw new Error(
        'Event validations are only available in the presence of a events path. Either add "eventsPath" or remove "eventValidationsPath"'
      );
    }

    if (this._commandsPath) {
      this._commandsInit();
      this._client.once('ready', () => {
        this._registerSlashCommands();
        this._commandValidationsPath && this._commandValidationsInit();
        this._handleCommands();
      });
    }

    if (this._eventsPath) {
      this._eventsInit();
      this._client.once('ready', () => {
        this._eventValidationsPath && this._eventValidationsInit();
      });
    }
  }

  _commandsInit() {
    let commands = buildCommandTree(this._commandsPath);
    this._commands = commands;
  }

  _registerSlashCommands() {
    registerCommands({
      client: this._client,
      commands: this._commands,
      testServer: this._testServer,
      logger: this._logger,
    });
  }

    _eventsInit() {
      const eventPaths = getFolderPaths(this._eventsPath);
  
      for (const eventPath of eventPaths) {
        const eventName = eventPath.replace(/\\/g, '/').split('/').pop();
  
        if (!eventName) continue;
  
        const eventFuncPaths = getFilePaths(eventPath, true);
        eventFuncPaths.sort();
  
        const eventFuncs = eventFuncPaths.map(eventFuncPath => require(eventFuncPath));
  
        this._client.on(eventName, async (...arg) => {
          for (const eventFunc of eventFuncs) {
            let canRun = true;
  
            const validationFuncs = this._eventValidationFuncs.get(eventName);
            if (validationFuncs && validationFuncs.length) {
              for (const validationFunc of validationFuncs) {
                const cantRunEvent = await validationFunc(...arg, this._client, this);
                if (cantRunEvent) {
                  canRun = false;
                  break;
                }
              }
            }
            if (canRun) {
              const cantRunEvent = await eventFunc(...arg, this._client, this);
              if (cantRunEvent) break;
            }
          }
        });
      }
    }

  _commandValidationsInit() {
    const validationFilePaths = getFilePaths(this._commandValidationsPath);
    validationFilePaths.sort();

    for (const validationFilePath of validationFilePaths) {
      const validationFunc = require(validationFilePath);
      if (typeof validationFunc !== 'function') {
        throw new Error(`Validation file ${validationFilePath} must export a function by default.`);
      }

      this._commandValidationFuncs.push(validationFunc);
    }
  }

  _eventValidationsInit() {
    const validationFolderPaths = getFolderPaths(this._eventValidationsPath);

    for (const validationFolderPath of validationFolderPaths) {
      const validationFilePaths = getFilePaths(validationFolderPath);
      validationFilePaths.sort();

      const eventName = validationFolderPath.replace(/\\/g, '/').split('/').pop();
      if (!eventName) continue;

      for (const validationFilePath of validationFilePaths) {
        const validationFunc = require(validationFilePath);
        if (typeof validationFunc !== 'function') {
          throw new Error(`Validation file ${validationFilePath} must export a function by default.`);
        }

        if (!this._eventValidationFuncs.has(eventName)) this._eventValidationFuncs.set(eventName, []);

        this._eventValidationFuncs.get(eventName)?.push(validationFunc);
      }
    }
  }

  _handleCommands() {
    this._client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this._commands.find((cmd) => cmd.name === interaction.commandName);
      if (command) {
        // Run validation functions
        if (this._commandValidationFuncs.length) {
          let canRun = true;

          for (const validationFunc of this._commandValidationFuncs) {
            const cantRunCommand = await validationFunc(interaction, command, this, this._client);
            if (cantRunCommand) {
              canRun = false;
              break;
            }
          }

          if (canRun) {
            await command.run({
              interaction,
              client: this._client,
              handler: this,
            });
          }
        } else {
          await command.run({
            interaction,
            client: this._client,
            handler: this,
          });
        }
      }
    });
  }

  get commands() {
    return this._commands;
  }
}
