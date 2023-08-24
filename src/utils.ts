import * as vscode from "vscode";
import { Uri } from "vscode";
import { Dict, filesKey, isNone } from "./types";

export const getFileName = (file: vscode.Uri) =>
  vscode.workspace.asRelativePath(file).split(/[/\\]/).pop() || "";

/**
 * Searches the loaded file tree by navigating the tree nodes with the given letters in input
 * @param tree The files tree to look in
 * @param input the initials to search the tree with
 * @returns array of files matching the input
 */
export const getMatchingFiles = (tree: Dict, input: string): Uri[] => {
  const [char, rest] = extractFirst(input);
  if (char === ".") {
    // Return files of format described in rest (ts,tsx, etc.)
    return tree[filesKey]
      .filter((file) => postFix(file).startsWith(rest))
      .sort(shorterPostFixComparator);
  }

  if (input.length === 0) {
    const longerFileNames: Uri[] = Object.keys(tree)
      .filter((key) => key !== filesKey)
      .map((key) => getMatchingFiles(tree[key], ""))
      .flat();

    return [...tree[filesKey], ...longerFileNames];
  }

  if (isNone(tree[char])) {
    return [];
  }

  return getMatchingFiles(tree[char], rest);
};

function extractFirst(str: string): [string, string] {
  const first = str.charAt(0).toUpperCase();
  const rest = str.slice(1);
  return [first, rest];
}

export function getFileInitials(file: Uri) {
  const name = file.path.split("/").pop();
  if (!name) {
    return null;
  }

  const words = name.split(/(?=[A-Z])/);
  return words.map((word) => word[0].toUpperCase()).join("");
}

const postFix = (file: Uri) => file.path.split(".").pop() || "";
const shorterPostFixComparator = (a: Uri, b: Uri) =>
  postFix(a).length - postFix(b).length;
