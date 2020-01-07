// Import and configure rulesdir plugin to allow custom project rules
const rulesDirPlugin = require('eslint-plugin-rulesdir');
rulesDirPlugin.RULES_DIR = './eslint/rules';

module.exports = {
  parser: 'babel-eslint',
  plugins: ['rulesdir', 'getsentry', 'flowtype'],
  extends: [
    './eslint/base.js',
    './eslint/react.js',
    './eslint/graphql.js',
    'plugin:flowtype/recommended',
    'prettier',
    'prettier/flowtype',
    'prettier/react',
  ],
  rules: {
    'rulesdir/translation-template-literal': 2,
    'getsentry/jsx-needs-i18n': 1,
    'flowtype/space-after-type-colon': [
      2,
      'always',
      {
        allowLineBreak: true,
      },
    ],
    'no-console': 'off',
    'no-danger': 'off',
    'react/require-default-props': 'off',
    'getsentry/jsx-needs-i18n': 'off',
    'react/no-danger': 'off',
    'react/no-unused-prop-types': 'off', // @TODO
    'graphql/template-strings': 'off', // @TODO
    'react/sort-comp': 'off',
    'react/no-did-mount-set-state': 'off',
    'react/no-array-index-key': 'off',
    'arrow-body-style': 'off',
    'react/jsx-no-target-blank': 'off',
    'react/no-find-dom-node': 'off',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: '16.4.0',
    },
  },
};
