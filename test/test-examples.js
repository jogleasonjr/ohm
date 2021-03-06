/* eslint-env node */

'use strict';

// --------------------------------------------------------------------
// Imports
// --------------------------------------------------------------------

var test = require('tape-catch');
var jsdom = require('jsdom');
var path = require('path');

// --------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------

var EXAMPLE_ROOT = path.normalize(path.join(__dirname, '../examples/'));

// Run the example at the given path (relative to `EXAMPLE_ROOT`), calling `cb` on completion.
// The examples are loaded using JSDOM (https://github.com/tmpvar/jsdom), a JavaScript
// implementation of the WHATWG DOM and HTML standards. Some things may behave slightly
// differently than a real browser environment.
function runExample(relativePath, testObj, cb) {
  var errors = [];
  jsdom.env({
    file: path.join(EXAMPLE_ROOT, relativePath),
    features: {
      FetchExternalResources: ['script', 'img', 'css', 'frame', 'iframe', 'link'],

      // Block URLs that begin with HTTP. The examples should use only local resources,
      // referenced by relative path.
      SkipExternalResources: /^http/
    },
    created: function(error, window) {
      if (error) {
        cb([error]);
      } else {
        jsdom.getVirtualConsole(window).sendTo(console);
        window.addEventListener('error', function(evt) {
          console.error(
              'In ' + evt.filename + '\n' +
              'at line ' + evt.lineno + ' (relative to start of script), col ' + evt.colno + ':');
          errors.push(evt.error);
        });
      }
    },
    onload: function(window) {
      // If the example specifies an inline test, run it.
      if (window.test) {
        testObj.test('test in ' + relativePath, window.test);
      }
      cb(errors);
      window.close();
    }
  });
}

// --------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------

test('math example', function(t) {
  runExample('math/index.html', t, function(errors) {
    t.deepEqual(errors, [], 'runs without errors');
    t.end();
  });
});

test('viz example', function(t) {
  runExample('viz/index.html', t, function(errors) {
    t.deepEqual(errors, [], 'runs without errors');
    t.end();
  });
});

test('csv example', function(t) {
  require(path.join(EXAMPLE_ROOT, 'csv', 'index.js'));
  t.end();
});

/*
TODO: implement new version of inherited attributes,
then update pl0 example and uncomment the following.

test('pl0 example', function(t) {
  runExample('pl0/index.html', t, function(errors) {
    t.equal(errors, null, 'runs without errors');
    t.end();
  });
});
*/

test('ecmascript examples', function(t) {
  var exampleDir = path.join(EXAMPLE_ROOT, 'ecmascript');
  var compile = require(path.join(exampleDir, 'compile.js'));

  t.ok(compile([__filename]), 'ES5 grammar works');
  t.ok(compile(['-g', 'es6', path.join(exampleDir, 'test.es6')]), 'ES6 grammar works');
  t.end();
});
