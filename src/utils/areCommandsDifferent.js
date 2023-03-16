export function areCommandsDifferent(existingCommand, localCommand) {
  if (
    localCommand.description !== existingCommand.description ||
    (localCommand.options?.length || 0) !== existingCommand.options.length
  ) {
    return true;
  } else {
    return false;
  }
}
