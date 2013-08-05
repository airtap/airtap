# zuul

Zuul is a test runner/harness to make running your mocha tests in a browser easier. Just point it at your mocha test files and let zuul consume them!

## zuul server

If you want to see the output of your mocha tests in a pretty browser window use zuul with the ```server``` option.

```shell
$ zuul --server 9000 /path/to/your/tests
```

Zuul will start a server on localhost:9000 which you can visit to get awesome html output (courtesy of mocha).

![html](https://raw.github.com/shtylman/zuul/master/img/html.png)

## headless zuul

If you just want to run your tests in a headless environment courtesy of mocha-phantomjs and phantomjs, zuul will oblige!

```shell
$ zuul /path/to/your/tests
```

![headless](https://raw.github.com/shtylman/zuul/master/img/headless.png)

## finding tests

You can specify either a specific javascript file(s) or a directory(s) to zuul. If you specify a directory, zuul will load all of the ```.js``` files in that directory.

## mocha.opts

If ```test/mocha.opts``` is available relative to your launch directory, then zuul will incorporate those options into the mocha setup.

## install

```shell
$ npm install -g zuul
```

## usage

```
zuul [options] file(s)|dir

Options:
  --server   port to start harness server for manual testing
  --wwwroot  location where the webserver will serve additional static files
  --ui       mocha ui (bdd, tdd, qunit, exports
  --config   point to a config file that overrides zuul settings
```

### config

Most likely zuul will serve your needs out of the box, but if you need to customize the `browserify` step, the
test fixture and/or want to add extra endpoints to the zuul test server, the `--config` option is your friend.

Lets say we have a `./zuul-config.js` file in our current directory, running `zuul --config ./zuul-config.js` picks up
eventual overrides specified in it, all of which are optional:

- **browserify**: `{Function}` that needs to return a browserify instance that can be initialized according to our needs
- **bundleOpts**: `{Object}` options passed to `browserify().bundle(options)`
- **fixture**: `{Function}` returning a `{String}` that allows overriding the [default html
  fixture](https://github.com/shtylman/zuul/blob/master/fixtures/index.html), but needs to keep the necessary setup
  (mocha, phantom) in order to work with zuul
- **initApp**: `{Function}` invoked with the `app` instance and `express` which allows adding endpoints to the app and
  whatever else you need to do to properly set up your tests

Here is an example `zuul-config.js`:

```js
var fs = require('fs');
var path = require('path');
var browserify = require('browserify');

// overriding the browserify instance creation in order to add a transform
exports.browserify = function () {
  return browserify().transform('brfs');

};

// at times we need to override browserify bundle options
exports.bundleOpts = { ignoreMissing: true, debug: true };

// we need to add a sinon.js script tag, so we'll use our custom fixture
exports.fixture = function () {
  return fs.readFileSync(path.join(testroot, 'fixture.html'), 'utf8');
};

exports.initApp = function (app, express) {
  var sinonpkg = path.join(path.dirname(require.resolve('sinon')), '..', 'pkg', 'sinon.js');

  // log requests made to the zuul test server
  app.use(express.logger('dev'));

  // provide the sinon file that we request via a script tag in our custom fixture
  app.get('/sinon.js', function (req, res) {
    res.sendfile(sinonpkg);
  });
};
```

### api

If you want to use this programmatically, do `var zuul = require('zuul')` and call it with some of these options.

- **files**: `{Array}` of test filenames or directory names. Defaults to `['test']`, which will pick up all `.js` files under the `test` directory under the CWD.
- **mochaOpts**: `{Object|String}` Either an object containing the Mocha options, or a string path to a `mocha.opts` file. Defaults to `test/mocha.opts` under the CWD.
- **port**: `{Number}` giving the port to run a server on for manual testing. Leaving this out will run the tests in PhantomJS.
- **ui**: `{String}` allowing you to easily specify or override the Mocha UI used (bdd, tdd, qunit, or exports). Takes precedence over `mochaOpts`.
- **wwwroot**: `{String}` giving a directory to serve static content from.
- **browserify**, **bundleOpts**, **fixture**, **initApp**: see config section above.

## credits

This probject is just a tiny tool. The real credit goes to these projects.

* [phantomjs](http://phantomjs.org/)
* [mocha](http://visionmedia.github.com/mocha/)
* [mocha-phantomjs](https://github.com/metaskills/mocha-phantomjs)
* [express](http://expressjs.com/)
* [browserify](https://github.com/substack/node-browserify)
