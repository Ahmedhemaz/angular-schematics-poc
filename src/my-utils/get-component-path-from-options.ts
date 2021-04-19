import { strings } from "@angular-devkit/core";

export function getComponentPathFrom(options: any): string {
  return (
    `/${options.path}/` +
    (options.flat ? "" : strings.dasherize(options.name) + "/") +
    strings.dasherize(options.name) +
    (options.type ? "." : "") +
    strings.dasherize(options.type)
  );
}
