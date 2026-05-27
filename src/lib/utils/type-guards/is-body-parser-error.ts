interface BodyParserError extends SyntaxError {
  status: number;
  body: string;
  type: string;
}

/**
 * Checks whether the error is a body-parser error (e.g., malformed JSON).
 *
 * @param err - The error to check.
 * @returns Whether the error is a body-parser error.
 */
export function isBodyParserError(err: unknown): err is BodyParserError {
  return (
    err instanceof SyntaxError &&
    'status' in (err as BodyParserError) &&
    (err as BodyParserError).status === 400 &&
    'body' in (err as BodyParserError)
  );
}
