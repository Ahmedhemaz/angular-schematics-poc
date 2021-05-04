export interface SkeletonComponentWithTest {
  name: string;
  type: string;
  style: string;
  selector: string;
  path: string;
  componentTestType: string;
  testPath?: string;
  project?: string;
  module?: string;
  testModule?: string;
  flat?: boolean;
  route?: string;
  export?: boolean;
  uiTestType?: boolean;
  libName?: string;
  skipTestCases?: boolean;
}
