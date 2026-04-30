import { ValidationError } from "../errors/ApiError";

export function parseIntParam(
  value: string | undefined,
  name: string,
): number {
  if (value === undefined) {
    throw new ValidationError(`Missing ${name}`, {
      error: `${name} must be provided`,
    });
  }
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) {
    throw new ValidationError(`Invalid ${name}`, {
      error: `${name} must be a valid number`,
    });
  }
  return n;
}
