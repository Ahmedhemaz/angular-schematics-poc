import { Tree } from "@angular-devkit/schematics";
import { addDeclarationToModule } from "../utility/ast-utils";
import { InsertChange } from "../utility/change";
import { getAddingComponentData } from "./get-adding-component-data";

export function addComponentToDeclarationInNgModule(options: any, host: Tree): void {
  const { source, modulePath, relativePath, classifiedName } = getAddingComponentData(
    options,
    host,
    options.module
  );

  const declarationChanges = addDeclarationToModule(
    source,
    modulePath as string,
    classifiedName,
    relativePath
  );

  const declarationRecorder = host.beginUpdate(modulePath as string);
  for (const change of declarationChanges) {
    if (change instanceof InsertChange) {
      declarationRecorder.insertLeft(change.pos, change.toAdd);
    }
  }
  host.commitUpdate(declarationRecorder);
}
