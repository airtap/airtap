# Debugging Airtap

**TLDR**: run `airtap --local 9000 --no-coverage test/mytest.js` and open up [http://localhost:9000/__zuul](http://localhost:9000/__zuul) in your browser of choice.

By default, Airtap can be difficult to debug because your source code is transformed to enable easy code coverage tests. I.e. your code looks like this:

```js
var __cov_HsIG3o$2IIarpa6am0m3eg = (Function('return this'))();
if (!__cov_HsIG3o$2IIarpa6am0m3eg.__coverage__) { __cov_HsIG3o$2IIarpa6am0m3eg.__coverage__ = {}; }
__cov_HsIG3o$2IIarpa6am0m3eg = __cov_HsIG3o$2IIarpa6am0m3eg.__coverage__;
```

Luckily there is an easy to way to fix this. Simply run Airtap with the `--no-coverage` option, and your code will be kept as normal, readable JavaScript.
