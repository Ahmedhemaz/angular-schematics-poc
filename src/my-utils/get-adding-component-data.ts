import { strings } from "@angular-devkit/core";
import { Tree } from "@angular-devkit/schematics";
import { AddingComponentData } from "../interfaces/adding-component-data.inteface";
import { buildRelativePath } from "../utility/find-module";
import { convertFileToAST } from "./convert-TS-to-AST";
import { getComponentPathFrom } from "./get-component-path-from-options";

export function getAddingComponentData(options: any, host: Tree, modulePath: string): AddingComponentData {
  const source = convertFileToAST(host, modulePath as string);
  const componentPath = getComponentPathFrom(options);
  const relativePath = buildRelativePath(modulePath as string, componentPath);
  const classifiedName = strings.classify(options.name) + strings.classify(options.type);
  return { source, modulePath, relativePath, classifiedName };
}
