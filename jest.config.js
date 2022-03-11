module.exports = {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+.ts$": "ts-jest",
  },
  testRegex: "^.+.test.ts$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
