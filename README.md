# c8js

![CI](https://github.com/AlexGoico/c8js/workflows/CI/badge.svg)

Chip8 implementation and API

## Development

To get started with development launch the 
webpack-dev-server with 
```
npm start
```

Then navigate to `localhost:8080` in a web browser
and begin adding functionality and the web browser
will automatically reload with your new changes.

### Notes

The project uses google's javascript style guide
enforced by eslint. JSDoc rules have been disabled
since eslint has deprecated the `require-jsdoc` and
`valid-jsdoc` used in the `eslint-config-google`.

The intent of the documentation is to document interfaces.
Thus despite what a particular model may output, you should
document all functions, classes, and variables a module
exports and all the return types associated with said module.

Ex. You have a module that exports a build function that returns
a class not exported by that module. The would be built object 
must also be documented in addition to the build function.

### References for development

* Cowgod's technical reference:
  * http://devernay.free.fr/hacks/chip8/C8TECH10.HTM
* Chip8 wikipedia
  * https://en.wikipedia.org/wiki/CHIP-8