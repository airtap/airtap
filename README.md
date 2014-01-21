# zuul [![Build Status](https://travis-ci.org/defunctzombie/zuul.png)](https://travis-ci.org/defunctzombie/zuul)

Zuul is an easy way to test your javascript in browsers. Start testing your code in seconds locally and move to cloud based browsers seamlessly for better coverage.

Zuul is different than other cross browser test runners in its simplicity and ability to easily run your test suite in many browsers without having them installed locally. It lets you iterate quickly during development and provide good browser coverage before release without worrying about missing a supported browser.

Don't just claim your js supports "all browsers", prove it with tests!

![zuul](https://f.cloud.github.com/assets/71256/1669799/fb463296-5c81-11e3-818a-26776dc7a256.jpg)

## Zuul workflow

Zuul works out of the box with a few commonly used javascript frameworks (qunit, mocha, tape, jasmine). If you are already testing using these, zuul setup will be trivial.

Zuul has 3 modes of operation: locally, cloud browsers, and continuous integration. You should make sure that zuul is working locally before you try to run the other two.

Once you have [installed](https://github.com/defunctzombie/zuul/wiki/installation) zuul proceed to the [quickstart](https://github.com/defunctzombie/zuul/wiki/quickstart) to write your first test.

### Running zuul locally

When iterating on your tests during development, simply use zuul `--local` mode to see your tests run in a browser.

![local zuul](https://raw.github.com/defunctzombie/zuul/gh-pages/develop-tests-locally.png)

See the [quickstart](https://github.com/defunctzombie/zuul/wiki/quickstart) page on the wiki for more details.

### Cross browser testing via Saucelabs

The reason we go through all this trouble in the first place is to seamlessly run our tests against all those browsers we don't have installed. Luckily, [saucelabs](https://saucelabs.com/) runs some browsers and we can easily task zuul to test on those.

![testing in the cloud](https://raw.github.com/defunctzombie/zuul/gh-pages/double-check-with-sauce.png)

See the [cooking with sauce](https://github.com/defunctzombie/zuul/wiki/cloud-testing) wiki page to get your tests running in the cloud.

### Continuous integration

No testing setup would be complete without a badge for passing or failing tests. After making sure your tests all pass in the cloud from your local machine, we will configure our tests to pass from travis-ci when we commit changes.

![local zuul](https://raw.github.com/defunctzombie/zuul/gh-pages/finalize-with-travis.png)

See the [travis-ci integration](https://github.com/defunctzombie/zuul/wiki/travis-ci) wiki page.

## Frameworks

The following frameworks are supported:

* mocha (tdd, qunit, and bdd flavors)
* tape
* qunit
* jasmine

### Examples

See the examples directory for some simple tests. Use the above knowledge to test the examples with your install of zuul.

* [quickstart](https://github.com/defunctzombie/zuul/tree/master/examples/quickstart) - from the [quickstart](https://github.com/defunctzombie/zuul/wiki/Quickstart) wiki tutorial
* [emberjs with qunit](https://github.com/defunctzombie/zuul/tree/master/examples/ember_w_qunit) - basic ember.js app with qunit tests
* [jasmine](https://github.com/defunctzombie/zuul/tree/master/examples/jasmine) - basic jasmine example

All of the examples can be tested locally by running the following command in each example directory.

```
zuul --local 8080 -- test.js
```

## zuul.yml

The zuul consumes a yaml config file. See the [zuul.yml](https://github.com/defunctzombie/zuul/wiki/zuul.yml) wiki page for all of the goodies this file provides.

It includes advanced usage like how to run an additional server to support tests that make ajax requests.

## License

MIT

## Credits

This probject is made possible by all the awesome modules it uses. See the `package.json` file for all the awesome.
