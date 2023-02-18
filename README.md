# DJS-Commander: A Library for Discord.js Projects

DJS-Commander is an easy-to-use JavaScript library that simplifies the process of handling commands, events, and validations in your Discord.js projects.

Discord.js version supported: `v14`

## Installation

To install DJS-Commander, simply run the following command:

```bash
npm install djs-commander
```

## Usage

```js
// index.js
const { Client, IntentsBitField } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const path = require('path');

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds], // Your bot's intents
});

new CommandHandler({
  client, // Discord.js client object
  commandsPath: path.join(__dirname, 'commands'), // The commands folder
  eventsPath: path.join(__dirname, 'events'), // The events folder
  validationsPath: path.join(__dirname, 'validations'), // Only works if commandsPath is provided
  testServer: 'TEST_SERVER_ID', // To register guild-based commands
});

client.login('YOUR_TOKEN_HERE');
```

## File Structure

### Commands

DJS-Commander allows a very flexible file structure for your commands directory. Here's an example of what your file structure could look like:

```
commands/
├── command1.js
├── command2.js
└── category/
	└── command3.js
	└── commands4.js
```

Any file inside the commands directory will be considered a command file, so make sure it properly exports an object. Like this:

```js
// commands/misc/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),

  run: (interaction, client) => {
    interaction.reply(`Pong! ${client.ws.ping}ms`);
  },

  // deleted: true, // Deletes the command from Discord
};
```

---

### Events

DJS-Commander assumes a specific file structure for your events. Here's an example of what your file structure could look like:

```
events/
├── ready/
|	├── console-log.js
|	└── webhook.js
|
└── messageCreate/
	├── auto-mod/
	|	├── delete-swear-words.js
	|	└── anti-raid.js
	|
	└── chat-bot.js
```

Make sure each file exports a default function. Like this:

```js
// events/ready/console-log.js
module.exports = (argument, client) => {
  console.log(`${client.user.tag} is online.`);
};
```

- `argument` is the argument you receive from the event being triggered (you can name this whatever you want). For example, the `messageCreate` event will give you an argument of the message object.

---

### Validations

DJS-Commander allows you to organize your validation files however you want to. Functions inside these files are executed in ascending order so you can prioritize your validations however you see fit. Here’s an example of what your file structure could look like:

```
validations/
└── dev-only.js
```

Make sure each file exports a default function. Like this:

```js
// validations/dev-only.js
module.exports = (interaction, commandObj) => {
  if (commandObj.devOnly) {
    if (interaction.member.id !== 'DEVELOPER_ID') {
      interaction.reply('This command is for the developer only');
      return true; // This will stop the command from being executed.
    }
  }
};
```

- `interaction` is the interaction object.
- `commandObj` is the command object exported from the command file itself. Properties such as `name`, `description` and `options` are all available within.

It's important to return `true` (or any truthy value) if you don't want the command execution to be stopped (this also ensures the next validation queued up is not run).
