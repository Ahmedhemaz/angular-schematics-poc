import { Path } from "@angular-devkit/core";
import { Tree } from "@angular-devkit/schematics";
import { insertImport } from "../utility/ast-utils";
import { InsertChange, NoopChange } from "../utility/change";
import { getAddingComponentData } from "./get-adding-component-data";

export function importComponent(options: any, host: Tree, routingModulePath: Path | undefined): void {
  const { source, relativePath, classifiedName } = getAddingComponentData(
    options,
    host,
    routingModulePath as string
  );
  const insertChange = insertImport(
    source,
    routingModulePath as string,
    classifiedName,
    relativePath
  ) as InsertChange;
  if (!(insertChange instanceof NoopChange)) {
    const insertImportRecorder = host.beginUpdate(routingModulePath as string);
    insertImportRecorder.insertLeft(insertChange.pos, insertChange.toAdd);
    host.commitUpdate(insertImportRecorder);
  }
}
