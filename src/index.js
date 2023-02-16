const { getFolderPaths, getFilePaths } = require('./utils/getPaths');

export class DiscordHandler {
  constructor({ client, commandsPath, eventsPath }) {
    if (!client) {
      throw new Error('Property "client" is required when instantiating DiscordHandler.');
    }

    this._commandsPath = commandsPath;
    this._eventsPath = eventsPath;
    this._commands = [];
    this._events = [];

    this._commandsPath && this.getCommands();
    this._eventsPath && this.getEvents();
  }

  getCommands() {
    console.log('🔍 Finding commands...');
    let categoryCount = 0;
    let commandCount = 0;
    let subcommandCount = 0;

    const categoryPaths = getFolderPaths(this._commandsPath);

    for (const categoryPath of categoryPaths) {
      categoryCount++;

      // Find any subcommand folders
      const subcommandPaths = getFolderPaths(categoryPath);
      if (subcommandPaths.length) {
        for (const subcommandPath of subcommandPaths) {
          const subcommandFilePaths = getFilePaths(subcommandPath);

          for (const subcommandFilePath of subcommandFilePaths) {
            subcommandCount++;
          }
        }
      }

      // Find regular command files
      const commandPaths = getFilePaths(categoryPath);
      for (const commandPath of commandPaths) {
        commandCount++;
      }
    }

    console.log(`${categoryCount} categories found.`);
    console.log(`${commandCount} commands found.`);
    console.log(`${subcommandCount} subcommands found.`);
  }

  getEvents() {}
}
