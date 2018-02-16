# Installation

Airtap is installed via [npm](https://npmjs.org). While airtap is written in node.js, your project doesn't have to use any node.js to benefit. In fact, airtap can easily be used to test ember.js, angular or other larger projects.

To install airtap for use during development simply run the following

```shell
npm install -g airtap
```

This will install airtap globally and make the `airtap` command available on the command line.

Once you have installed airtap, verify it works by going to one of the examples (in the examples folder) and running airtap.

```shell
airtap --local 8080 -- test
```

Open the url airtap shows and see the tests run. That's it! You are now ready for the [quickstart](./quickstart.md) guide to write your first tests.
