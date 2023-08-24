// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getFileName, getMatchingFiles } from "./utils";
import { Uri } from "vscode";
import { FilesTree } from "./FilesTree";
import { isNone } from "./types";

type Pickable = {
  label: string;
  uri: Uri;
  description: string;
  alwaysShow: boolean;
};
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log("Starting Quicker");
  const config = vscode.workspace.getConfiguration("quickeropen");
  const includePaths = config.get<string[]>("paths", ["**/src/**"]);
  const excludePattern = config.get<string[]>("excludePath", [
    "**/node_modules/**",
  ]);

  let filesTree = new FilesTree();
  void vscode.workspace
    .findFiles(`{${includePaths.join(",")}}`, `{${excludePattern.join(",")}}`)
    .then(filesTree.loadFiles);

  let disposable = vscode.commands.registerCommand(
    "quickeropen.quickOpenInitials",
    async () => {
      const quickPick = vscode.window.createQuickPick<Pickable>();
      quickPick.items = [];
      quickPick.placeholder = "Type to search for files";
      quickPick.onDidChangeValue((input) => {
        if (input.length < 2 || isNone(filesTree)) {
          return;
        }

        filesTree.doWhenLoaded((filesDict) => {
          quickPick.items = getMatchingFiles(filesDict, input).map(toPickable);
          console.log(
            `finished. items: ${quickPick.items
              .map((val) => val.label)
              .join(", ")}`
          );
        });
      });

      quickPick.onDidAccept(() => {
        const item = quickPick.selectedItems[0];
        if (item) {
          vscode.window.showTextDocument(item.uri!);
        }
        quickPick.hide();
      });
      quickPick.show();
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

const toPickable = (file: Uri): Pickable => ({
  label: getFileName(file),
  description: vscode.workspace.asRelativePath(file),
  uri: file,
  alwaysShow: true,
});
