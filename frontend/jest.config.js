module.exports = {
  // collectCoverageFrom: [
  //   '**/*.{js,jsx,ts,tsx}',
  //   '!**/*.d.ts',
  //   '!**/node_modules/**',
  // ],
  moduleDirectories: ['node_modules', './src'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/.storybook/',
    '<rootDir>/public/',
    '<rootDir>/scripts/',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
