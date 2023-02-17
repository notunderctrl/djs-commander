export function areCommandsDifferent(existingCommand, localCommand) {
  if (localCommand.description !== existingCommand.description || localCommand.options.length !== existingCommand) {
    return true;
  } else {
    return false;
  }
}
