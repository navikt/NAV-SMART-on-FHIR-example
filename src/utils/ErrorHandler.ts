export function handleError(message: string, err: unknown): string {
  if (err instanceof Error) {
    return `${message}: ${err.message}`;
  } else if (typeof err == 'string') {
    return `${message}: ${err}`;
  } else {
    return `${message}: An unknown error occurred: ${err}`
  }
}