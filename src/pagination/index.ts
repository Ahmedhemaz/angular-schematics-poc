import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  branchAndMerge,
  mergeWith,
  url,
  chain,
  applyTemplates,
  move,
} from "@angular-devkit/schematics";
import { strings } from "@angular-devkit/core";
import { Pagination } from "./schema";
import { parseName } from "../utility/parse-name";
import { createDefaultPath } from "../utility/workspace";

export default function (options: Pagination): Rule {
  return async (host: Tree, context: SchematicContext) => {
    context.logger.info("Pagination: " + JSON.stringify(options));

    if (!options.name) {
      throw new SchematicsException("Option (name) is required.");
    }

    if (options.path === undefined) {
      options.path = await createDefaultPath(host, options.project as string);
    }

    const parsedPath = parseName(options.path as string, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;
    context.logger.info("Pagination: " + options.path);

    const templateSource = apply(url("./files"), [
      applyTemplates({
        ...strings,
        ...options,
      }),
      move(parsedPath.path),
    ]);

    return chain([branchAndMerge(chain([mergeWith(templateSource)]))]);
  };
}
