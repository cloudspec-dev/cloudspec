module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  globals: {
    CLOUD_SPEC_PROJECT_NAME: 'cloud-spec',
  }
};
