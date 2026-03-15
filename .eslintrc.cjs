module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist/', 'node_modules/', 'designs/', 'd35cb609-ad74-48a3-a8b4-26879657ff81/'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    'prefer-const': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.ts'],
      env: { node: true },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
      },
    },
  ],
};
