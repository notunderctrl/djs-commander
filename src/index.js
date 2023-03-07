const { getFolderPaths, getFilePaths } = require('./utils/getPaths');
const { buildCommandTree } = require('./utils/buildCommandTree');
const { registerCommands } = require('./utils/registerCommands');

export class CommandHandler {
  constructor({ client, commandsPath, eventsPath, validationsPath, testServer }) {
    if (!client)
      throw new Error('Property "client" is required when instantiating CommandHandler.');

    this._client = client;
    this._commandsPath = commandsPath;
    this._eventsPath = eventsPath;
    this._validationsPath = validationsPath;
    this._testServer = testServer;
    this._commands = []; // includes all the properties and methods exported from command file
    this._commandsToRegister = []; // doesn't include the `deleted` or `run` properties
    this._validationFuncs = [];

    if (this._validationsPath && !commandsPath) {
      throw new Error(
        'Command validations are only available in the presence of a commands path. Either add "commandsPath" or remove "validationsPath"'
      );
    }

    if (this._commandsPath) {
      this._commandsInit();
      this._client.once('ready', () => {
        this._registerSlashCommands();
        this._validationsPath && this._validationsInit();
        this._handleCommands();
      });
    }

    if (this._eventsPath) {
      this._eventsInit();
    }
  }

  _commandsInit() {
    let commands = buildCommandTree(this._commandsPath);
    this._commands = commands;
    this._commandsToRegister = JSON.parse(JSON.stringify(commands));
  }

  _registerSlashCommands() {
    registerCommands({
      client: this._client,
      commands: this._commandsToRegister,
      testServer: this._testServer,
    });
  }

  _eventsInit() {
    const eventPaths = getFolderPaths(this._eventsPath);

    for (const eventPath of eventPaths) {
      const eventName = eventPath.replace(/\\/g, '/').split('/').pop();
      const eventFuncPaths = getFilePaths(eventPath, true);
      eventFuncPaths.sort();

      this._client.on(eventName, async (arg) => {
        for (const eventFuncPath of eventFuncPaths) {
          const eventFunc = require(eventFuncPath);
          await eventFunc(arg, this._client, this);
        }
      });
    }
  }

  _validationsInit() {
    const validationFilePaths = getFilePaths(this._validationsPath);
    validationFilePaths.sort();

    for (const validationFilePath of validationFilePaths) {
      const validationFunc = require(validationFilePath);
      if (typeof validationFunc !== 'function') {
        throw new Error(`Validation file ${validationFilePath} must export a function by default.`);
      }

      this._validationFuncs.push(validationFunc);
    }
  }

  _handleCommands() {
    this._client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this._commands.find((cmd) => cmd.name === interaction.commandName);
      if (command) {
        // Run validation functions
        if (this._validationFuncs.length) {
          let canRun = true;

          for (const validationFunc of this._validationFuncs) {
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
      } else {
        interaction.reply({ content: 'Command not found.', ephemeral: true });
      }
    });
  }

  get commands() {
    return this._commands;
  }
}
