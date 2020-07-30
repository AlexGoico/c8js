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
    'indent': ['error', 2],
    'require-jsdoc': 0,
    'valid-jsdoc': 0,
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
