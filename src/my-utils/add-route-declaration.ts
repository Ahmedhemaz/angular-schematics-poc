import { Path } from "@angular-devkit/core";
import { Tree } from "@angular-devkit/schematics";
import { BuildRouteFn } from "../interfaces/build-route.interface";
import { addRouteDeclarationToModule } from "../utility/ast-utils";
import { InsertChange } from "../utility/change";
import { getAddingComponentData } from "./get-adding-component-data";

export function addRouteDeclaration(
  options: any,
  host: Tree,
  routingModulePath: Path | undefined,
  buildRoute: BuildRouteFn
): void {
  const { source } = getAddingComponentData(options, host, routingModulePath as string);
  const addDeclaration = addRouteDeclarationToModule(
    source,
    routingModulePath as string,
    buildRoute(options, options.module as string)
  ) as InsertChange;
  const recorder = host.beginUpdate(routingModulePath as string);
  recorder.insertLeft(addDeclaration.pos, addDeclaration.toAdd);
  host.commitUpdate(recorder);
}
