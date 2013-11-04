# zuul [![Build Status](https://travis-ci.org/defunctzombie/zuul.png)](https://travis-ci.org/defunctzombie/zuul)

Zuul makes testing client side javascript easy! Use the zuul local server while developing tests and when ready to publish your changes, use zuul to test your code in cloud browsers.

Don't just claim your js supports "all browsers", prove it with tests!

## Using Zuul

Zuul is meant to be used for developing your tests locally as well as with continuous integration tools like [travis-ci](https://travis-ci.org/). All you need to get started with zuul is a library you want to test and a file with some tests. The following walkthorugh will get you up and running locally and then show you how to test your project in the cloud!

### 1. install zuul

Beforew we can use zuul we need to install it. We will install zuul globally so we can use it to debug our browser tests. Later we will install it so we can use it with continuous intragration tests.

```shell
npm install -g zuul
```

### 2. write some code you want to test

`my-module.js` would look like the following. Note the use of node.js/commonjs style module pattern locally. This is important so the tests can use your module code. See the example modules section later in this readme for code tested with zuul. If you are familiar with writing mocha tests then zuul will work out of the box in most cases.

```js
function html(el, html) {
    if (!html) {
        return el.innerHTML = '';
    }
	el.innerHTML = html;
}

module.exports = html;
```

### 3. write a test file

Tests are written using [mocha](http://visionmedia.github.io/mocha/). I recommend using the `tdd` or `qunit` testing style for simplicity; your tests will look match your examples. Also recommend using the default [assert](http://nodejs.org/api/assert.html) module as shown below. You are of course free to use the other styles and zuul with support them. You can also use other assertion frameworks.

`test.js` would contain something like the following:

```js
var assert = require('assert');
var html = require(./my-module');

suite('html');

test('should set inner html', function() {
    var el = document.createElement('div');
    html(el, '<p>foobar</p>');
    assert.equal(el.innerHTML, '<p>foobar</p>');
});

test('should clear inner html', function() {
    var el = document.createElement('div');
    el.innerHTML = 'foobar';
    html(el);
    assert.equal(el.innerHTML, '');
});
```

### 4. launch zuul

```shell
zuul --local 9000 --ui qunit -- test.js
```

### 5. open a browser and see your tests

The zuul command will print a url. Open this url in any local browser and your tests will run.

### 6. Rinse and repeat

Make changes to your code and test files as needed. No need to restart zuul, just refresh your browser.

## zuul in the cloud

Local testing is just the start and should be used to get your tests running and make sure they pass on your browser and in your dev environment. Great client modules should also be tested across different browsers and operating systems. For this, we will leverage [saucelabs](https://saucelabs.com/home) to run our same tests in the browser.

### 1. get a saucelabs account

Open source projects can use the awesome [free for open source](https://saucelabs.com/opensauce) version. User's with a saucelabs account already can skip this step.

### 2. configure your account

Once you have a sauce account, they will assign you an `access key`. Open `~/.zuulrc` with your favorite editor and make it look like the following:

```yaml
sauce_username: my_awesome_username
sauce_key: 550e8400-e29b-41d4-a716-446655440000
```

Obviously replace with your name and key

### 3. select browsers to test

Back in your project directory, add the following file `.zuul.yml`

```yaml
ui: qunit
browsers:
  - name: chrome
    version: 27..latest
```

This will run our tests on the `chrome` web browser and test all versions from 27 to latest availabel on saucelabs.

### 4. run zuul

```shell
zuul -- test
```

Notice that we do not specify --local since we will run in the cloud. Zuul will create a server, establish a tunnel, and then ask saucelabs to run your tests. You can open your [saucelabs dashboard](https://saucelabs.com/account) to see yur tests being run. Zuul will exit when all tests are done.

## credits

This probject is made possible by all the awesome modules it uses. The real credit goes to these projects and the many others not listed.

* [mocha](http://visionmedia.github.com/mocha/)
* [express](http://expressjs.com/)
* [localtunnel](http://localtunnel.me/)
* [mocha-cloud](https://github.com/visionmedia/mocha-cloud)
* [browserify](https://github.com/substack/node-browserify)
* [bouncy](https://github.com/substack/bouncy)

And others! See the `package.json` file for all the awesome.