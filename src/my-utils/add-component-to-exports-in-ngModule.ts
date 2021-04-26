import { Tree } from "@angular-devkit/schematics";
import { addExportToModule } from "../utility/ast-utils";
import { InsertChange } from "../utility/change";
import { getAddingComponentData } from "./get-adding-component-data";

export function addComponentToExportsInNgModule(options: any, host: Tree): void {
  const { source, modulePath, relativePath, classifiedName } = getAddingComponentData(
    options,
    host,
    options.module
  );
  const exportChanges = addExportToModule(source, modulePath as string, classifiedName, relativePath);
  const exportRecorder = host.beginUpdate(modulePath as string);
  for (const change of exportChanges) {
    if (change instanceof InsertChange) {
      exportRecorder.insertLeft(change.pos, change.toAdd);
    }
  }
  host.commitUpdate(exportRecorder);
}
