import ts from 'typescript';

/** Parse JSONC without damaging comments, URL strings or trailing commas. */
export function parseJsonc(text, filename = 'configuration.jsonc') {
  const { config, error } = ts.parseConfigFileTextToJson(filename, text);
  if (error) {
    throw new SyntaxError(`${filename}: ${ts.flattenDiagnosticMessageText(error.messageText, '\n')}`);
  }
  return config;
}
