# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)

## [0.0.44] - 2023-03-21

### Added

- Support for stopping event functions.
- TypeScript support for development.

## [0.0.43] - 2023-03-16

### Added

- Support for the following slash command properties:
  - `name_localizations`
  - `description_localizations`
  - `default_permission`,
  - `default_member_permissions`,
  - `dm_permission`,

### Fixed

- Options length not defaulting to 0 when commands are created using regular objects

## [0.0.42] - 2023-03-07

### Added

- Multiple arguments support for events

## [0.0.41] - 2023-03-07

### Fixed

- "deleted" property not working for commands.

## [0.0.40] - 2023-03-05

### Fixed

- Typings for TypeScript projects.

## [0.0.39] - 2023-02-24

### Fixed

- Incomplete `commandObj` in validation files

## [0.0.38] - 2023-02-20

### Fixed

- Undefined client object inside validation functions

## [0.0.37] - 2023-02-20

### Added

- Reflect v0.0.36 changes to README.md

## [0.0.36] - 2023-02-20

No breaking changes

### Added

- Client parameter to validation functions

### Changed

- Internal function naming

## [0.0.35] - 2023-02-20

### Added

- Link to documentation

## [0.0.34] - 2023-02-19

### Fixed

- Fix README.md validation return message.

## [0.0.33] - 2023-02-19

### Added

- Add a commands property for the CommandHandler instance
- Allow commands to have access to the CommandHandler instance

### Changed

- Opt for object destructuring in command parameters
- README.md examples.

### Fixed

- README.md examples.
