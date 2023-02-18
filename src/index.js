const { getFolderPaths, getFilePaths } = require('./utils/getPaths');
const { buildCommandTree } = require('./utils/buildCommandTree');
const { registerCommands } = require('./utils/registerCommands');

export class DiscordHandler {
  constructor({ client, commandsPath, eventsPath, validationsPath, testServer }) {
    if (!client) throw new Error('Property "client" is required when instantiating DiscordHandler.');

    this._client = client;
    this._commandsPath = commandsPath;
    this._eventsPath = eventsPath;
    this._validationsPath = validationsPath;
    this._testServer = testServer;
    this._commands = [];
    this._events = [];

    if (this._commandsPath) {
      this._commandsInit();
      this._client.once('ready', () => {
        this._registerSlashCommands();
        this._handleCommands();
      });
    }

    if (this._eventsPath) {
      this._eventsInit();
    }
  }

  _commandsInit() {
    this._commands = buildCommandTree(this._commandsPath);
  }

  _registerSlashCommands() {
    registerCommands({
      client: this._client,
      commands: this._commands,
      testServer: this._testServer,
    });
  }

  _eventsInit() {
    // Regular event handler
    const eventPaths = getFolderPaths(this._eventsPath);

    for (const eventPath of eventPaths) {
      const eventName = eventPath.replace(/\\/g, '/').split('/').pop();
      const eventFuncPaths = getFilePaths(eventPath, true);

      this._client.on(eventName, async (arg) => {
        for (const eventFuncPath of eventFuncPaths) {
          const eventFunc = require(eventFuncPath);
          await eventFunc(arg, this._client);
        }
      });
    }
  }

  _handleCommands() {
    this._client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this._commands.find((cmd) => cmd.name === interaction.commandName);
      if (command) {
        await command.run(interaction, this._client);
      }
    });
  }

  get commands() {
    return this._commands;
  }
}
