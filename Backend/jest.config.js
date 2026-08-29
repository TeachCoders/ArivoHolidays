export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": ["@swc/jest", { jsc: { parser: { syntax: "ecmascript" } } }],
  },
  testMatch: ["**/tests/**/*.test.js"],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
};
