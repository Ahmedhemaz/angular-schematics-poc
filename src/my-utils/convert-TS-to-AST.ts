import { SchematicsException, Tree } from "@angular-devkit/schematics";
import ts = require("../third_party/github.com/Microsoft/TypeScript/lib/typescript");

export function convertFileToAST(host: Tree, filePath: string): ts.SourceFile {
  const text = host.read(filePath);
  if (!text) throw new SchematicsException(`File ${filePath} does not exist.`);
  const sourceCodeText: string = text.toString("utf-8");
  return ts.createSourceFile(filePath, sourceCodeText, ts.ScriptTarget.Latest, true);
}
