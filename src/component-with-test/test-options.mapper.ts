export function mapOptionsToTestOptions(options: any) {
  const testOptions: any = {};
  testOptions.path = options.testPath;
  testOptions.type = options.componentTestType;
  testOptions.skipTestCases = options.skipTestCases;
  testOptions.name = options.name;
  testOptions.flat = options.flat;
  testOptions.uiTestType = options.uiTestType;
  testOptions.libName = options.libName;

  return testOptions;
}
