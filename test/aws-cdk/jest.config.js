module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
};
