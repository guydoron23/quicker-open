import { Uri } from "vscode";

export const filesKey = "files";
export type Dict = {
  [key: string]: any;
  [filesKey]: Uri[];
};

export const createCleanDict = (): Dict => ({ [filesKey]: [] });

export type Optional<T> = T | None;

export type None = undefined | null;

export function isDefined<T>(value: Optional<T>): value is Exclude<T, None> {
  // eslint-disable-next-line eqeqeq
  return value != null;
}

export function isNone<T>(value: Optional<T>): value is None {
  // eslint-disable-next-line eqeqeq
  return value == null;
}
