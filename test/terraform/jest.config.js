module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
    "^.+\\.tf$": ["@hekto/cloud-spec-terraform/dist/jest-terraform-transform"],
  },
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  globals: {
    CLOUD_SPEC_PROJECT_NAME: 'cloud-spec',
  },
};
