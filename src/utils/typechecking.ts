// used at the end of `if` statements to ensure all modes are checked
export const exhaustive = (value: never): never => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`got unexpected exhaustive value: ${value}`);
};
