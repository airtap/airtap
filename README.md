# zuul

Zuul is a test runner/harness to make running your mocha tests in a browser easier. Just point it at your mocha test files and let zuul consume them!

## zuul server

If you want to see the output of your mocha tests in a pretty browser window use zuul with the ```server``` option.

```shell
$ zuul --server 9000 /path/to/your/test/*.js
```

Zuul will start a server on localhost:9000 which you can visit to get awesome html output (courtesy of mocha).

[![html output](/shtylman/zuul/img/html.png)]

## headless zuul

If you just want to run your tests in a headless environment courtesy of mocha-phantomjs and phantomjs, zull will oblige!

```shell
$ zuul /path/to/your/test/*.js
```

[![headless](/shtylman/zuul/img/headless.png)]

## install

```shell
$ npm install -g zuul
```

## credits

This probject is just a tiny tool. The real credit goes to these projects.

* [phantomjs](http://phantomjs.org/)
* [mocha](http://visionmedia.github.com/mocha/)
* [mocha-phantomjs](https://github.com/metaskills/mocha-phantomjs)
* [express](http://expressjs.com/)
* [browserify](https://github.com/substack/node-browserify)
