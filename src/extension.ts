// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getFileName, getMatchingFiles, matchCamelCase } from "./utils";
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
  console.log("Starting quickpick");
  const config = vscode.workspace.getConfiguration("camelCaseQuickOpen");
  const includePaths = config.get<string[]>("paths", ["**/src/**"]);
  const excludePattern = config.get<string[]>("excludePath", [
    "**/node_modules/**",
  ]);

  let filesTree = new FilesTree();
  void vscode.workspace
    .findFiles(`{${includePaths.join(",")}}`, `{${excludePattern.join(",")}}`)
    .then(filesTree.loadFiles);

  let disposable = vscode.commands.registerCommand(
    "quickpick.camelCaseQuickOpen",
    async () => {
      const quickPick = vscode.window.createQuickPick<Pickable>();
      quickPick.items = [];
      quickPick.placeholder = "Type to search for files";
      quickPick.onDidChangeValue((input) => {
        if (input.length < 2 || isNone(filesTree)) {
          return;
        }

        filesTree.doWhenLoaded((filesDict) => {
          quickPick.items = getMatchingFiles(filesDict, input).map(
            fileToPickItem
          );
          console.log(
            `finished. items: ${quickPick.items.map((val) =>
              JSON.stringify(val)
            )}`
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

  //-----------------------------------------------------------------------------------------------------------------
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "quickpick" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable2 = vscode.commands.registerCommand(
    "quickpick.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from QuickPick!");
    }
  );

  //context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

const fileToPickItem = (file: Uri): Pickable => ({
  //label: "a".repeat(index) + vscode.workspace.asRelativePath(file),
  label: getFileName(file),
  description: vscode.workspace.asRelativePath(file),
  uri: file,
  alwaysShow: true,
});
