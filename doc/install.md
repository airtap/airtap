# Installation

Zuul is installed via [npm](https://npmjs.org). While zuul is written in node.js, your project doesn't have to use any node.js to benefit. In fact, zuul can easily be used to test ember.js, angular or other larger projects.

To install zuul for use during development simply run the following

```shell
npm install -g zuul
```

This will install zuul globally and make the `zuul` command available on the command line.

Once you have installed zuul, verify it works by going to one of the examples (in the examples folder) and running zuul.

```shell
zuul --local 8080 -- test
```

Open the url zuul shows and see the tests run. That's it! You are now ready for the [quickstart](./quickstart.md) guide to write your first tests.
