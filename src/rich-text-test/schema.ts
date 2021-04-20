export interface RichTextOptions {
  name: string;
  type: string;
  path: string;
  project?: string;
  module?: string;
  flat?: boolean;
  route?: string;
  export?: boolean;
  skipTestCases?: boolean;
}
