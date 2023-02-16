export class DiscordHandler {
  constructor({ client, commandsPath, eventsPath }) {
    if (!client) {
      throw new Error('Property "client" is required when instantiating DiscordHandler.');
    }

    this._commandsPath = commandsPath;
    this._eventsPath = eventsPath;
    this.init();
  }

  init() {}
}
