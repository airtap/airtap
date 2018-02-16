# using zuul with travis matrix

To set up Travis using the matrix feature with Zuul, you can take advantage of the command line flags to launch tests for an individual browser. Here is an example of usage: `zuul --browser-name chrome --browser-version 29 --browser-platform="Windows 2008" test/index.js`. When using the browser flags, all other configuration is read from the `.zuul.yml` config.

To use the flags in your `.travis.yml` file, you can set up a simple configuration with environmental variables. Below is the relevant piece of a Makefile `test` task that runs node tests if the `BROWSER_NAME` variable is not defined. Otherwise it runs tests with Zuul using the individual browser represented by the `BROWSER_NAME` and `BROWSER_VERSION` variables.

```
test:
	@if [ "x$(BROWSER_NAME)" = "x" ]; then make test-node; else make test-zuul; fi

test-node:
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		test/index.js

test-zuul:
	@./node_modules/zuul/bin/zuul \
			--browser-name $(BROWSER_NAME) \
			--browser-version $(BROWSER_VERSION) \
			test/index.js
```

When `npm test` is configured to run `make test`, your matrix configuration can now look something like this:

```
matrix:
  include:
  - node_js: '0.10'
    env: BROWSER_NAME=chrome BROWSER_VERSION=36
  - node_js: '0.10'
    env: BROWSER_NAME=safari BROWSER_VERSION=latest
  - node_js: '0.10'
    env: BROWSER_NAME=ie BROWSER_VERSION=6
```
