# phantom js

# PhantomJS

Airtap has builtin support for running your tests via [PhantomJS](http://phantomjs.org/) allowing for fast test iteration during development using `--phantom` CLI flag.

## Flags
```
--phantom # Run tests in PhantomJS instance
--phantom-remote-debugger-port=[port] # Wait for remote debugger on [port] before running tests
--phantom-remote-debugger-autorun # Run tests before remote debugger is connected
```

## Usage
```
airtap --phantom -- test.js
```

The `--phantom` flag works much like the `--local` flag we saw in the quickstart except that it doesn't require you to open a browser and will report all test results on the command line.

In order for the `--phantom` flag to function, you will need to install the [phantomJS node wrapper]() as a devDependency for your project as shown in the sample `package.json` file below.

```json
{
  "devDependencies": {
    "airtap": "<airtap version>",
    "phantomjs": "<phantomjs version>"
  }
}
```

## Debugging
In order to debug your PhantomJS runs you can provide the `remote-debugger-port` flag:

```
# Start PhantomJS waiting for remote debugger session on port 3000
airtap --phantom --phantom-remote-debugger-port=3000 -- test.js
```

This will start a PhantomJS instance waiting for a remote debugger session to connect before executing any tests. See the [PhantomJS documentation](http://phantomjs.org/troubleshooting.html) for directions about debugging.

To run your tests right away but allow for a remote debugging session specify the `autorun` flag
```
# Start PhantomJS running tests immediately and allow
airtap --phantom --phantom-remote-debugger-port=3000 --phantom-remote-debugger-autorun -- test.js
```

---
See [PhantomJS Troubleshooting](http://phantomjs.org/troubleshooting.html) for more information
