# airtap

**Run TAP unit tests in 1789+ browsers.** Airtap is a command-line interface to unit test your JavaScript in browsers, using a TAP-producing harness like `tape`. Start testing locally and seamlessly move to browsers in the cloud for full coverage. Airtap runs browsers concurrently and lets you iterate quickly during development. Don't just claim your JavaScript supports "all browsers", prove it with tests!

[![npm](https://img.shields.io/npm/v/airtap.svg)](https://www.npmjs.com/package/airtap)
[![Node version](https://img.shields.io/node/v/airtap.svg)](https://www.npmjs.com/package/airtap)
[![Test](https://img.shields.io/github/workflow/status/airtap/airtap/Test?label=test)](https://github.com/airtap/airtap/actions/workflows/test.yml)
[![Standard](https://img.shields.io/badge/standard-informational?logo=javascript\&logoColor=fff)](https://standardjs.com)
[![Common Changelog](https://common-changelog.org/badge.svg)](https://common-changelog.org)

## Table of Contents

<details><summary>Click to expand</summary>

- [Install](#install)
- [Getting Started](#getting-started)
  - [Adding Browsers](#adding-browsers)
- [Available Providers](#available-providers)
- [Cloud Testing With Sauce Labs](#cloud-testing-with-sauce-labs)
  - [1. Set Credentials](#1-set-credentials)
  - [2. Select Browsers](#2-select-browsers)
  - [3. Set Hostname](#3-set-hostname)
- [Continuous Integration](#continuous-integration)
  - [Travis CI](#travis-ci)
    - [1. Setup Travis](#1-setup-travis)
    - [2. Add Test Script](#2-add-test-script)
    - [3. Enable Code Coverage](#3-enable-code-coverage)
    - [4. Set Credentials](#4-set-credentials)
  - [GitHub Actions](#github-actions)
- [CLI](#cli)
- [Configuration](#configuration)
  - [`providers` (array)](#providers-array)
  - [`browsers` (array)](#browsers-array)
    - [Specific version of a browser on a specific platform](#specific-version-of-a-browser-on-a-specific-platform)
    - [Range of versions of a browser](#range-of-versions-of-a-browser)
    - [Range of versions with negative start index.](#range-of-versions-with-negative-start-index)
    - [Disjoint versions](#disjoint-versions)
    - [Disjoint with ranges](#disjoint-with-ranges)
    - [Float version numbers](#float-version-numbers)
  - [`browserify` (array)](#browserify-array)
    - [IE < 11 support](#ie--11-support)
  - [`server` (string or object)](#server-string-or-object)
  - [Firefox Profile](#firefox-profile)
- [Who Uses Airtap?](#who-uses-airtap)
- [Contributing](#contributing)
- [License](#license)

</details>

## Install

With [npm](https://npmjs.org) do:

```
npm install airtap --save-dev
```

If you are upgrading or migrating from [`zuul`](https://github.com/defunctzombie/zuul): please see the [upgrade guide](./UPGRADING.md).

## Getting Started

You'll need an entry point for your tests like `test.js`. For a complete example see [`airtap-demo`](https://github.com/airtap/demo). If you already have an entry point, go ahead and run it with:

```
airtap test.js
```

Out of the box, this will launch the default browser on your system. To keep the browser open and automatically reload when you make changes to your test files, run:

```
airtap --live test.js
```

### Adding Browsers

In order to run other (and more than one) browsers, create a `.airtap.yml` file in your working directory, containing at least one provider and at least one browser. For example:

```yaml
providers:
  - airtap-system

browsers:
  - name: chrome
  - name: ff
```

Providers discover browsers on a particular platform or remote service. In the above example, [`airtap-system`][airtap-system] finds browsers installed on your machine which Airtap then matches against the `browsers` you specified.

You can include multiple providers and let Airtap find the best matching browser(s):

```yaml
providers:
  - airtap-playwright
  - airtap-system

browsers:
  - name: ff
    version: 78
```

You can also match browsers by provider:

<details><summary>Click to expand</summary>

```yaml
browsers:
  - name: ff
    provider: airtap-system
```

</details>

Airtap, providers and browsers are tied together by [manifests](https://github.com/airtap/browser-manifest). They define the name and other metadata of browsers. You can see these manifests by running `airtap -l` or `-la` which is short for `--list-browsers --all`. For example:

<details><summary>Click to expand</summary>

```
$ airtap -la
- name: electron
  title: Electron 9.0.5
  version: 9.0.5
  options:
    headless: true
  provider: airtap-electron
```

</details>

Airtap can match browsers on any manifest property, with the exception of `options` which exists to customize the browser behavior. Options are specific to a provider. For example, the `airtap-playwright` provider supports disabling headless mode and setting custom command-line arguments:

```yaml
browsers:
  - name: chromium
    options:
      headless: false
      launch:
        args: [--lang=en-US]
```

For more information on the `browsers` field, see [Configuration](#configuration).

## Available Providers

Providers must be installed separately.

| **Package**                              | **Description**                                    |
| :--------------------------------------- | :------------------------------------------------- |
| [`airtap-system`][airtap-system]         | Locally installed browsers on Linux, Mac & Windows |
| [`airtap-playwright`][airtap-playwright] | Playwright (headless Chromium, FF and WebKit)      |
| [`airtap-sauce`][airtap-sauce]           | Remote browsers in Sauce Labs                      |
| [`airtap-electron`][airtap-electron]     | Electron                                           |
| [`airtap-default`][airtap-default]       | Default browser                                    |
| [`airtap-manual`][airtap-manual]         | Manually open a URL in a browser of choice         |

## Cloud Testing With Sauce Labs

The [`airtap-sauce`][airtap-sauce] provider runs browsers on [Sauce Labs](https://saucelabs.com/). Sauce Labs offers quite a few browsers, with a wide range of versions and platforms.

_Open source projects can use the [free for open source](https://saucelabs.com/opensauce) version of Sauce Labs._

### 1. Set Credentials

Airtap needs to know your Sauce Labs credentials. You don't want to commit these sensitive credentials to your git repository. Instead set them via the environment as `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY`.

### 2. Select Browsers

Add the `airtap-sauce` provider and wanted browsers to `.airtap.yml`:

```yaml
providers:
  - airtap-sauce

browsers:
  - name: chrome
  - name: ios_saf
  - name: ie
```

### 3. Set Hostname

Airtap runs a server to serve JavaScript test files to browsers. The `airtap-sauce` provider establishes a tunnel to your local machine so that Sauce Labs can find that server. For this to work, some browsers need a custom loopback hostname, because they don't route `localhost` through the tunnel. Add the following to your [`hosts`](https://en.wikipedia.org/wiki/Hosts_%28file%29) file:

```
127.0.0.1 airtap.local
```

You are now ready to run your tests in the cloud with `airtap test.js`.

## Continuous Integration

After making sure your tests pass when initiated from your local machine, you can setup continuous integration to run your tests whenever changes are committed. Any CI service that supports Node.js will work.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/level-js.svg)](https://saucelabs.com/u/level-js)

### Travis CI

#### 1. Setup Travis

Take a look at the Travis [getting started](http://about.travis-ci.org/docs/user/languages/javascript-with-nodejs/) guide for Node.js. At minimum we need to create a `.travis.yml` file containing:

```yaml
language: node_js
node_js:
  - 12
addons:
  hosts:
    - airtap.local
```

#### 2. Add Test Script

Add the following to your `package.json`:

```json
{
  "scripts": {
    "test": "airtap test.js"
  }
}
```

#### 3. Enable Code Coverage

Optionally enable code coverage with the `--coverage` flag. This will collect code coverage per browser into the `.nyc-output/` folder in [Istanbul](https://istanbul.js.org/) 1.0 format. Afterwards you can generate reports with [`nyc report`](https://github.com/istanbuljs/nyc), which takes care of merging code coverage from multiple browsers.

A typical setup for Travis looks like:

```json
{
  "scripts": {
    "test": "airtap --coverage test.js"
  }
}
```

You can choose to post the results to [`coveralls`](https://coveralls.io/) (or similar) by adding a step to `.travis.yml`:

```yaml
after_success: npm run coverage
```

```json
{
  "scripts": {
    "test": "airtap --coverage test.js",
    "coverage": "nyc report --reporter=text-lcov | coveralls"
  }
}
```

#### 4. Set Credentials

Skip this step if you're not using the [`airtap-sauce`][airtap-sauce] provider. Same as when initiating tests locally, we need to get Sauce Labs credentials to Travis. Luckily Travis has a feature called [secure environment variables](http://about.travis-ci.org/docs/user/build-configuration/#Secure-environment-variables). You'll need to set 2 of those: `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY`.

### GitHub Actions

Should work in theory :)

## CLI

Usage: `airtap [options] <files>`. Supports multiple `files`. They can be paths relative to the working directory or glob patterns (e.g. `airtap test/*.js`). Options:

```
-v --version          Print version and exit
-l --list-browsers    List (effective or --all) browsers
-a --all              Test or list all available browsers
   --coverage         Enable code coverage analysis
   --live             Keep browsers open to allow repeated test runs
-c --concurrency <n>  Number of browsers to test concurrently, default 5
-r --retries <n>      Number of retries when running a browser, default 6
-t --timeout <n>      How long to wait for test results, default 5m. Can
                      be a number in milliseconds or a string with unit.
-p --preset <preset>  Select a configuration preset
-s --server <script>  Path to script that runs a support server
   --loopback <host>  Custom hostname that equals or resolves to 127.0.0.1
   --verbose          Enable airtap debug output
   --silly            Enable all debug output
-h --help             Print help and exit.
```

<details><summary>Examples (click to expand)</summary>

List all available browsers:

```
airtap -la
```

Test browsers specified in .airtap.yml:

```
airtap test.js
```

Test all available browsers (careful):

```
airtap -a test.js
```

Test multiple files:

```
airtap "test/*.js"
```

</details>

## Configuration

Airtap consumes a YAML config file at `.airtap.yml` in the working directory. The following fields are available.

### `providers` (array)

### `browsers` (array)

List of browsers to test in the cloud. Each entry should contain a `name` property. Additional properties like `version` and `platform` may be specified depending on the provider.

The `version` property defaults to `latest` and can be a specific version number, the keyword `latest`, the keyword `oldest`, or (for Firefox and Chrome) one of the keywords `beta`  or `dev`.

```yaml
browsers:
  - name: chrome
  - name: firefox
    version: beta
```

#### Specific version of a browser on a specific platform

Only supported by the `airtap-sauce` provider at the time of writing, as other providers do not run browsers on a particular platform.

```yaml
browsers:
  - name: chrome
    version: 28
    platform: Windows XP
```

#### Range of versions of a browser

```yaml
browsers:
  - name: firefox
    version: 14..latest
  - name: ie
    version: 9..11
```

#### Range of versions with negative start index.

This example would test the latest three stable versions of Firefox (latest - 2, latest - 1, latest).

```yaml
browsers:
  - name: firefox
    version: -2..latest
```

#### Disjoint versions

```yaml
browsers:
  - name: firefox
    version: [19, 20]
```

#### Disjoint with ranges

```yaml
browsers:
  - name: firefox
    version: [19, 20, 23..latest]
  - name: chrome
    version: [-1..latest, beta]
```

#### Float version numbers

```yaml
browsers:
  - name: ios_saf
    version: '8.0..latest'
```

Float version numbers should be quoted.

### `browserify` (array)

You can set any of the items in the following list, and they'll be passed to [`browserify`](https://github.com/browserify/browserify).

- `plugin`
- `external`
- `ignore`
- `exclude`
- `transform`
- `add`
- `require`

They can be repeated and accept options.

```yaml
browserify:
  - require: ./some-file.js
    expose: intimidate
  - transform: brfs
  - transform: jadeify
```

You can also customize what's passed to `browserify(options)`.

```yaml
browserify:
  - options:
      node: true
```

#### IE < 11 support

To support IE < 11, an older version of the [`buffer`](https://github.com/feross/buffer) polyfill is required. Use the following configuration and run `npm install buffer@4`:

```yaml
# Use buffer@4 to support IE < 11
browserify:
  - require: 'buffer/'
    expose: 'buffer'
```

### `server` (string or object)

This field can point to an optional shell command or JavaScript file to run as a support server. It will be started before all tests and stopped afterwards. This allows testing websockets and other network requests. Your command will be run with the `AIRTAP_SUPPORT_PORT` environment variable set to a port number you must use. If your server does not listen on this port it will be unreachable (on browser providers that use a tunnel).

```yaml
server: ./test/support/server.js
```

We recommend writing simple support servers using [`http`](https://nodejs.org/api/http.html) or [`express`](http://expressjs.com/). For shell commands you can use `$AIRTAP_SUPPORT_PORT` in the arguments, which will be substituted:

```yaml
server: "python -m SimpleHTTPServer $AIRTAP_SUPPORT_PORT"
```

### Firefox Profile

The [`airtap-sauce`][airtap-sauce] provider supports running Firefox instances with custom user profiles. This allows you to configure anything you can change in `about:config` programmatically for a test run. You can set these options with a section under any Firefox browser entry:

```yaml
browsers:
  - name: firefox
    options:
      profile:
        webgl.force-enabled: true
```

## Who Uses Airtap?

**Lots of folks!** Collectively, packages that depend on Airtap get 100's of millions of downloads per month!

- [`level`](https://github.com/Level/level) (and dependencies)
- [`webtorrent`](https://github.com/webtorrent/webtorrent) (and dependencies)
- [`simple-peer`](https://github.com/feross/simple-peer)
- [`buffer`](https://github.com/feross/buffer)
- [`stream-http`](https://github.com/jhiesey/stream-http)
- [`readable-stream`](https://github.com/nodejs/readable-stream)
- _Send a PR to add your package to the list!_

## Contributing

Airtap is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [contribution guide](CONTRIBUTING.md) for more details.

## License

MIT © [Roman Shtylman](https://github.com/defunctzombie), [Zuul contributors](https://github.com/defunctzombie/zuul/graphs/contributors) and [Airtap contributors](https://github.com/airtap).

[airtap-system]: https://github.com/airtap/system

[airtap-playwright]: https://github.com/airtap/playwright

[airtap-sauce]: https://github.com/airtap/sauce

[airtap-electron]: https://github.com/airtap/electron

[airtap-default]: https://github.com/airtap/default

[airtap-manual]: https://github.com/airtap/manual
