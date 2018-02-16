# Quickstart

This walkthrough will show you how to write some tests for a very basic "module". We will be writing our tests using [mocha](http://visionmedia.github.io/mocha/) qunit testing style. Your tests can be in any mocha style or even use the original qunit framework.

Start off by writing some code you want to test.

### 1. write some code

In our case, we will be testing the following commonjs style module. Your code does not have to use commonjs, but it is recommended for clarity between multiple files in your project. Commonjs modules are simple, just set the `module.exports` object to any value you want exposed outside the file. Files are "modules".

Assume our file will be called `my-module.js`

```javascript
function html(el, html) {
    if (!html) {
        return el.innerHTML = '';
    }
    el.innerHTML = html;
}

module.exports = html;
```

### 2. write a test file

I recommend using the `tdd` or `qunit` testing style for simplicity in your tests so that your tests can closer match the code you will write for examples. I also recommend using the default [assert](http://nodejs.org/api/assert.html) module as shown below; however, you are of course free to use the other styles or assertion frameworks and airtap with support them.

`test.js` would contain something like the following:

```javascript
var assert = require('assert');

// our test file needs to know where to find the module relative to itself
var html = require('./my-module');

// general category for the tests that follow
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

### 3. launch airtap

Now that we have written our tests, we are ready to launch airtap! Simply run the following command in the same directory as your two files.

```shell
airtap --local 8080 --ui mocha-qunit -- test.js
```

### 4. open a browser

The airtap command will print a url. Open this url in any local browser and your tests will run (and hopefully pass).

### 5. Rinse and repeat

Make changes to your code and test files as needed. No need to restart airtap, just refresh your browser.

## Done

That's it, you have airtap running locally and all your tests are passing. You are now ready for some awesome [cloud testing](./cloud-testing.md)
