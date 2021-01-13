/**
 * @returns wallaby config
 */
module.exports = function() {
  return {
    autoDetect: true,

    files: [
      'src/**/*.js',
    ],

    env: {
      type: 'node',
    },

    testFramework: 'jest',
  };
};
