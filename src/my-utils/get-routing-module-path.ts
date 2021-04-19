import { Path } from "@angular-devkit/core";
import { Tree } from "@angular-devkit/schematics";
import { normalize } from "@angular-devkit/core";
import { MODULE_EXT, ROUTING_MODULE_EXT } from "../utility/find-module";

export function getRoutingModulePath(host: Tree, modulePath: string): Path | undefined {
  const routingModulePath = modulePath.endsWith(ROUTING_MODULE_EXT)
    ? modulePath
    : modulePath.replace(MODULE_EXT, ROUTING_MODULE_EXT);
  console.log(routingModulePath);
  return host.exists(routingModulePath) ? normalize(routingModulePath) : undefined;
}
