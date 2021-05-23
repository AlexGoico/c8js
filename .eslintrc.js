module.exports = {
  'env': {
    'browser': true,
    'es2020': true,
    'node': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 11,
    'sourceType': 'module',
  },
  'plugins': [
    'jsdoc',
  ],
  'rules': {
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1,
      },
    ],
    'require-jsdoc': 0,
    'valid-jsdoc': 0,
    'linebreak-style': [
      'error',
      process.env.NODE_ENV === 'prod' ? 'unix' : 'windows',
    ],
    'newline-per-chained-call': [
      'error',
      {
        'ignoreChainWithDepth': 3,
      },
    ],
    'jsdoc/require-param': 2,
    'jsdoc/require-param-type': 2,
    'jsdoc/require-returns': 2,
    'jsdoc/require-throws': 2,
    'jsdoc/require-jsdoc': [
      'error',
      {
        'publicOnly': true,
        'require': {
          'ArrowFunctionExpression': true,
          'ClassDeclaration': true,
          'ClassExpression': true,
          'FunctionDeclaration': true,
          'FunctionExpression': true,
          'MethodDefinition': true,
        },
      },
    ],
    'brace-style': [
      'error',
      'stroustrup',
    ],
  },
};
