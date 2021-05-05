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
  filter,
} from "@angular-devkit/schematics";
import { Path, strings } from "@angular-devkit/core";
import { SkeletonComponentWithTest } from "./schema";
import { parseName } from "../utility/parse-name";
import { createDefaultPath } from "../utility/workspace";
import { findModuleFromOptions } from "../utility/find-module";
import { addComponentToDeclarationInNgModule } from "../my-utils/add-component-declaration-to-ngModule";
import { addComponentToExportsInNgModule } from "../my-utils/add-component-to-exports-in-ngModule";
import { getRoutingModulePath } from "../my-utils/get-routing-module-path";
import { addRouteDeclaration } from "../my-utils/add-route-declaration";
import { importComponent } from "../my-utils/import-component";
import { classify } from "@angular-devkit/core/src/utils/strings";
import { mapOptionsToTestOptions } from "./test-options.mapper";

function addDeclarationToNgModule(options: SkeletonComponentWithTest): Rule {
  return (host: Tree) => {
    addComponentToDeclarationInNgModule(options, host);
    if (options.export) {
      addComponentToExportsInNgModule(options, host);
    }
    return host;
  };
}

function buildRoute(options: any, _modulePath: string) {
  let url: string = `${classify(options.name)}${classify(options.type)}.getTestingRoute().path`;
  url = options.skipTestCases ? url : `${url}+'/:testcaseId'`;
  return `{ path: ${url} , component: ${classify(options.name)}${classify(options.type)} }`;
}

function addRouteDeclarationToNgModule(options: any, routingModulePath: Path | undefined): Rule {
  return (host: Tree) => {
    addRouteDeclaration(options, host, routingModulePath, buildRoute);
    importComponent(options, host, routingModulePath);
    return host;
  };
}

export default function (options: SkeletonComponentWithTest): Rule {
  return async (host: Tree, _context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException("Option (name) is required.");
    }

    if (!options.path) {
      options.path = await createDefaultPath(host, options.project as string);
    }
    options.module = findModuleFromOptions(host, options);

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

    ///////////////////////////// test

    const testOptions: any = mapOptionsToTestOptions(options);

    testOptions.module = findModuleFromOptions(host, testOptions);

    const routingModulePath = getRoutingModulePath(host, testOptions.module as string);

    const parsedTestPath = parseName(testOptions.path as string, testOptions.name);
    testOptions.name = parsedTestPath.name;
    testOptions.path = parsedTestPath.path;

    const templateTestSource = apply(url("./files/tests-templates"), [
      testOptions.skipTestCases ? filter((path) => !path.endsWith(".testcases.ts.template")) : noop(),
      applyTemplates({
        ...strings,
        "if-flat": (s: string) => (testOptions.flat ? "" : s),
        ...testOptions,
      }),
      !testOptions.type
        ? forEach(((file) => {
            return file.path.includes("..")
              ? {
                  content: file.content,
                  path: file.path.replace("..", "."),
                }
              : file;
          }) as FileOperator)
        : noop(),
      move(parsedTestPath.path + "/" + strings.dasherize(parsedTestPath.name)),
    ]);

    return chain([
      branchAndMerge(chain([addDeclarationToNgModule(options), mergeWith(templateSource)])),
      branchAndMerge(
        chain([
          addDeclarationToNgModule(testOptions),
          addRouteDeclarationToNgModule(testOptions, routingModulePath),
          mergeWith(templateTestSource),
        ])
      ),
    ]);
  };
}
