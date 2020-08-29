const { resolve } = require('path');
const tsConfig = resolve(__dirname, 'tsconfig.test.json');

module.exports = projectDir => {
  const pkg = require(resolve(projectDir, 'package.json'));
  return {
    displayName: pkg.name,
    rootDir: projectDir,
    testEnvironment: 'node',
    globals: { 'ts-jest': { tsConfig } },
    transform: { '^.+\\.(t|j)sx?$': 'ts-jest' },
    modulePathIgnorePatterns: ['dist', 'lib'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/lib/'],
  };
};
