import { Uri, window } from "vscode";
import { createCleanDict, Dict, filesKey, isNone } from "./types";
import { getFileInitials } from "./utils";

type Handler = (files: Dict) => void;
export class FilesTree {
  private _files: Dict = createCleanDict();
  private isLoaded = false;
  private tempEventHandlerQueue: Handler[] = [];

  public get files() {
    return this._files;
  }

  public doWhenLoaded = (handler: Handler) => {
    if (this.isLoaded) {
      handler(this._files);
    } else {
      this.tempEventHandlerQueue.push(handler);
    }
  };

  public loadFiles = (files: Uri[]) => {
    files.forEach((file: Uri) => {
      const initials = getFileInitials(file);

      if (isNone(initials)) {
        window.showErrorMessage(
          `QuickPick: Failed to parse file initials. path: ${file.path}`
        );
        return;
      }

      let pointer: Dict = this._files;
      for (let i = 0; i < initials!.length; i++) {
        const char = initials[i].toUpperCase();
        if (isNone(pointer[char])) {
          pointer[char] = createCleanDict();
        }

        const charDict: Dict = pointer[char];

        // Last char
        if (i === initials.length - 1) {
          // push file to leaf array
          charDict[filesKey].push(file);
        } else {
          // more letters to come, set pointer to next dict
          pointer = charDict;
        }
      }
    });

    this.isLoaded = true;
    this.tempEventHandlerQueue.forEach((handler) => handler(this._files));
    this.tempEventHandlerQueue = [];
    window.showInformationMessage("QuickPick finished loading files");
    console.log("Finished loading files");
  };
}
