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
import { strings, Path } from "@angular-devkit/core";
import { RichTextOptions } from "./schema";
import { parseName } from "../utility/parse-name";
import { createDefaultPath } from "../utility/workspace";
import { buildRelativePath, findModuleFromOptions } from "../utility/find-module";
import { convertFileToAST } from "../my-utils/convert-TS-to-AST";
import { getComponentPathFrom } from "../my-utils/get-component-path-from-options";
import {
  addDeclarationToModule,
  addExportToModule,
  addRouteDeclarationToModule,
  insertImport,
} from "../utility/ast-utils";
import { InsertChange, NoopChange } from "../utility/change";
import { getRoutingModulePath } from "../my-utils/get-routing-module-path";
import { classify } from "@angular-devkit/core/src/utils/strings";

function addDeclarationToNgModule(options: RichTextOptions): Rule {
  return (host: Tree) => {
    const modulePath = options.module;
    let source = convertFileToAST(host, modulePath as string);
    const componentPath = getComponentPathFrom(options);
    const relativePath = buildRelativePath(modulePath as string, componentPath);
    const classifiedName = strings.classify(options.name) + strings.classify(options.type);
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
    if (options.export) {
      source = convertFileToAST(host, modulePath as string);
      const exportChanges = addExportToModule(source, modulePath as string, classifiedName, relativePath);
      const exportRecorder = host.beginUpdate(modulePath as string);
      for (const change of exportChanges) {
        if (change instanceof InsertChange) {
          exportRecorder.insertLeft(change.pos, change.toAdd);
        }
      }
      host.commitUpdate(exportRecorder);
    }
    return host;
  };
}

function buildRoute(options: RichTextOptions, _modulePath: string) {
  let url: string = `${classify(options.name)}${classify(options.type)}.getTestingRoute().path`;
  url = options.skipTestCases ? url : `${url}+'/:testcaseId'`;
  return `{ path: ${url} , component: ${classify(options.name)}${classify(options.type)} }`;
}

function addRouteDeclarationToNgModule(options: RichTextOptions, routingModulePath: Path | undefined): Rule {
  return (host: Tree) => {
    const addDeclaration = addRouteDeclarationToModule(
      convertFileToAST(host, routingModulePath as string),
      routingModulePath as string,
      buildRoute(options, options.module as string)
    ) as InsertChange;

    const recorder = host.beginUpdate(routingModulePath as string);
    recorder.insertLeft(addDeclaration.pos, addDeclaration.toAdd);
    host.commitUpdate(recorder);

    let source = convertFileToAST(host, routingModulePath as string);
    const componentPath = getComponentPathFrom(options);
    const relativePath = buildRelativePath(routingModulePath as string, componentPath);
    const classifiedName = strings.classify(options.name) + strings.classify(options.type);

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
    return host;
  };
}

export default function (options: RichTextOptions): Rule {
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

    const templateSource = apply(url("./files"), [
      options.skipTestCases ? filter((path) => !path.endsWith(".testcases.ts.template")) : noop(),
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
