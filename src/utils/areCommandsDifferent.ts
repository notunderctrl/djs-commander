interface Command {
  description: string;
  options?: Array<object>;
}

export function areCommandsDifferent(existingCommand: Command, localCommand: Command) {
  if (
    localCommand.description !== existingCommand.description ||
    (localCommand.options?.length || 0) !== existingCommand.options?.length
  ) {
    return true;
  } else {
    return false;
  }
}
