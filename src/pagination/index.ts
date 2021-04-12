import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  // branchAndMerge,
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
import { strings } from "@angular-devkit/core";
import { Pagination } from "./schema";
import { parseName } from "../utility/parse-name";
import { createDefaultPath } from "../utility/workspace";
import { findModuleFromOptions } from "../utility/find-module";

export default function (options: Pagination): Rule {
  return async (host: Tree, context: SchematicContext) => {
    context.logger.info("Pagination: " + JSON.stringify(options));

    if (!options.name) {
      throw new SchematicsException("Option (name) is required.");
    }

    if (options.path === undefined) {
      options.path = await createDefaultPath(host, options.project as string);
    }
    options.module = findModuleFromOptions(host, options);
    context.logger.info("Pagination NgModule: " + options.module);
    const parsedPath = parseName(options.path as string, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;
    context.logger.info("Pagination: " + parsedPath.path);

    const templateSource = apply(url("./files"), [
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
      move(parsedPath.path + "/" + parsedPath.name),
    ]);

    return chain([branchAndMerge(chain([mergeWith(templateSource)]))]);
  };
}
