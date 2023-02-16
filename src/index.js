const { getFolderPaths, getFilePaths } = require('./utils/getPaths');

export class DiscordHandler {
  constructor({ client, commandsPath, eventsPath }) {
    if (!client) throw new Error('Property "client" is required when instantiating DiscordHandler.');

    this._commandsPath = commandsPath;
    this._eventsPath = eventsPath;
    this._commands = [];
    this._events = [];

    this._commandsPath && this.commandsInit();
    this._eventsPath && this.eventsInit();
  }

  commandsInit() {
    console.log('🔍 Finding commands...');
    let categoryCount = 0;
    let commandCount = 0;
    let subcommandGroupCount = 0;
    let subcommandCount = 0;

    const categoryPaths = getFolderPaths(this._commandsPath);

    for (const categoryPath of categoryPaths) {
      categoryCount++;

      const categoryName = categoryPath.replace(/\\/g, '/').split('/').pop().toLowerCase();

      // Find any subcommand folders
      const subcommandPaths = getFolderPaths(categoryPath);
      if (subcommandPaths.length) {
        for (const subcommandPath of subcommandPaths) {
          subcommandGroupCount++;

          const subcommandGroupName = subcommandPath.replace(/\\/g, '/').split('/').pop().toLowerCase();

          const subcommandFilePaths = getFilePaths(subcommandPath);

          this._commands.push({ name: subcommandGroupName, options: [], category: categoryName });

          for (const subcommandFilePath of subcommandFilePaths) {
            subcommandCount++;

            const subcommandName = subcommandFilePath.replace(/\\/g, '/').split('/').pop().split('.')[0].toLowerCase();

            const subcommandObj = require(subcommandFilePath);
            if (typeof subcommandObj !== 'object') {
              throw new Error(`Subcommand "${subcommandGroupName} ${subcommandName}" needs to export an object.`);
            }

            const { description, options, callback } = subcommandObj;
            if (!description || !callback) {
              throw new Error(`Subcommand "${subcommandGroupName} ${subcommandName}" must have "description" and "callback".`);
            }
            if (typeof callback !== 'function') {
              throw new Error(`Callback for subcommand "${subcommandGroupName} ${subcommandName}" must be a function.`);
            }

            const commandGroup = this._commands.find((cmd) => cmd.name === subcommandGroupName);
            commandGroup.options.push({
              name: subcommandName,
              description,
              options: options || [],
              type: 2,
            });
          }
        }
      }

      // Find regular command files
      const commandPaths = getFilePaths(categoryPath);
      for (const commandPath of commandPaths) {
        commandCount++;

        const commandName = commandPath.replace(/\\/g, '/').split('/').pop().split('.')[0].toLowerCase();

        // If command already exists as a subcommand group
        if (this._commands.some((cmd) => cmd.name === commandName)) {
          throw new Error(`Command "${commandName}" already has a subcommand group. Either delete the subcommand or the regular command.`);
        }

        const commandObj = require(commandPath);
        if (typeof commandObj !== 'object') throw new Error(`Command "${commandName}" needs to export an object.`);

        const { description, options, callback } = commandObj;
        if (!description || !callback) throw new Error(`Command "${commandName}" must have "description" and "callback".`);
        if (typeof callback !== 'function') throw new Error(`Callback for command "${commandName}" must be a function.`);

        this._commands.push({
          name: commandName,
          description,
          options: options || [],
          callback,
          category: categoryName,
        });
      }
    }

    console.log(`✨ ${categoryCount} ${categoryCount > 1 ? 'categories' : 'category'} found.`);
    console.log(`✨ ${commandCount} ${commandCount > 1 ? 'commands' : 'command'} found.`);
    console.log(`✨ ${subcommandGroupCount} subcommand ${subcommandGroupCount > 1 ? 'groups' : 'group'} found.`);
    console.log(`✨ ${subcommandCount} ${subcommandCount > 1 ? 'subcommands' : 'subcommand'} found.`);
  }

  eventsInit() {}
}
