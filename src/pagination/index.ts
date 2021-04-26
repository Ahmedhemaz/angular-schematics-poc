import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  mergeWith,
  url,
  chain,
  applyTemplates,
  move,
  FileOperator,
  forEach,
  noop,
  branchAndMerge,
} from "@angular-devkit/schematics";
import { strings, Path } from "@angular-devkit/core";
import { Pagination } from "./schema";
import { parseName } from "../utility/parse-name";
import { createDefaultPath } from "../utility/workspace";
import { findModuleFromOptions } from "../utility/find-module";
import { getRoutingModulePath } from "../my-utils/get-routing-module-path";
import { classify } from "@angular-devkit/core/src/utils/strings";
import { addComponentToDeclarationInNgModule } from "../my-utils/add-component-declaration-to-ngModule";
import { addComponentToExportsInNgModule } from "../my-utils/add-component-to-exports-in-ngModule";
import { importComponent } from "../my-utils/import-component";
import { addRouteDeclaration } from "../my-utils/add-route-declaration";

function addDeclarationToNgModule(options: Pagination): Rule {
  return (host: Tree) => {
    addComponentToDeclarationInNgModule(options, host);
    if (options.export) {
      addComponentToExportsInNgModule(options, host);
    }
    return host;
  };
}

function buildRoute(options: Pagination, _modulePath: string) {
  return `{ path: ${classify(options.name)}${classify(
    options.type
  )}.getTestingRoute().path , component: ${classify(options.name)}${classify(options.type)} }`;
}

function addRouteDeclarationToNgModule(options: Pagination, routingModulePath: Path | undefined): Rule {
  return (host: Tree) => {
    addRouteDeclaration(options, host, routingModulePath, buildRoute);
    importComponent(options, host, routingModulePath);
    return host;
  };
}

export default function (options: Pagination): Rule {
  return async (host: Tree, _context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException("Option (name) is required.");
    }

    if (options.path === undefined) {
      options.path = await createDefaultPath(host, options.project as string);
    }
    options.module = findModuleFromOptions(host, options);

    const routingModulePath = getRoutingModulePath(host, options.module as string);

    const parsedPath = parseName(options.path as string, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;

    const templateSource = apply(url("./files/component-templates"), [
      applyTemplates({
        ...strings,
        "if-flat": (s: string) => (options.flat ? "" : s),
        ...options,
      }),
      !options.type
        ? forEach(((file) => {
            return file.path.includes("..")
              ? {
                  content: file.content,
                  path: file.path.replace("..", "."),
                }
              : file;
          }) as FileOperator)
        : noop(),
      move(parsedPath.path + "/" + strings.dasherize(parsedPath.name)),
    ]);

    return chain([
      branchAndMerge(
        chain([
          addDeclarationToNgModule(options),
          addRouteDeclarationToNgModule(options, routingModulePath),
          mergeWith(templateSource),
        ])
      ),
    ]);
  };
}
