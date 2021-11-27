# Upgrade Guide

This document describes breaking changes and how to upgrade. For a complete list of changes including minor and patch releases, please refer to the [changelog](CHANGELOG.md).

## 4.0.0

**Airtap 4 is a modular rewrite that supports concurrent local browsers, headless testing with Playwright, starting Sauce Labs from your local machine & from GitHub Actions, and live reload on any browser.**

### New modules

**Browsers have been abstracted away into [`abstract-browser`](https://github.com/airtap/abstract-browser) and [`browser-provider`](https://github.com/airtap/browser-provider).** The purpose of the latter is to discover browsers on a particular platform or remote service and expose them to Airtap. Coming from Airtap 3, which was primarily meant to run Sauce Labs browsers, you'll want to install the [`airtap-sauce`](https://github.com/airtap/sauce) provider and add it to `airtap.yml`:

```
npm install airtap-sauce --save-dev
```

```yaml
providers:
  - airtap-sauce
```

### New browsers

**You can now run tests on headless Playwright browsers, by including the [`airtap-playwright`](https://github.com/airtap/playwright) provider in your configuration. Or locally installed browsers with [`airtap-system`](https://github.com/airtap/system).** Or include multiple providers and let Airtap find the best matching browser:

```yaml
providers:
  - airtap-playwright
  - airtap-system

browsers:
  - name: ff
    version: 78
```

For details, please see the [README](./README.md).

### Integrated Sauce Connect

**The `airtap-sauce` provider includes the Sauce Connect tunnel, which means Airtap can now start Sauce browsers from your local machine and from GitHub Actions.** The `tunnel-id / tunnel_id` option has been removed.

Only `localhost` and `airtap.local` are routed through the tunnel, with [SSL bumping disabled](https://github.com/airtap/airtap/issues/129). In addition, Airtap only starts a tunnel if it is testing browsers [that require one](https://github.com/airtap/browser-manifest#wants). If you are using the Travis Sauce Connect addon you can (choose to) keep doing so and Airtap will skip starting a tunnel itself.

### Replaced `--electron` and `--local`

**The `--electron` and `--local` flags have been removed in favor of providers.** The relevant providers to check out are [`airtap-electron`](https://github.com/airtap/electron), [`airtap-default`](https://github.com/airtap/default) and [`airtap-manual`](https://github.com/airtap/manual). The `airtap-default` provider behaves like `--local --open` did: it opens the default browser. While the `airtap-manual` provider behaves like `--local` did.

You may recall that the `--electron` and `--local` flags also overrode any browsers defined in `airtap.yml`. To achieve that same exclusive behavior, use a _preset_ which selectively overrides your root configuration:

<details><summary>Click to expand</summary>

```yaml
providers:
  - airtap-sauce

browsers:
  - name: chrome

presets:
  local:
    providers:
      - airtap-system
```

```bash
airtap test.js # runs chrome in sauce labs
airtap -p local test.js # runs local chrome
```

Or:

```yaml
providers:
  - airtap-sauce
  - airtap-default

browsers:
  - name: chrome

presets:
  local:
    browsers:
      - name: default
```

```bash
airtap test.js # runs chrome in sauce labs
airtap -p local test.js # runs local default browser
```

</details>

### Introducing `--live`

**On any browser, Airtap now exits by default after the tests complete.** To allow repeated runs like before, pass the new `--live` flag. This keeps Airtap running and doesn't close the browser. When `browserify` errors, Airtap exits unless `--live`. When you make changes to your test files during a test, browsers are automatically reloaded.

### Changes to matching of browsers

**As a general rule, Airtap 4 defaults to a small set of browsers.** Browsers are deduplicated by properties you did not explicitly match on. Each entry in `browsers` will match exactly one browser, unless multiple versions are specified. If your specified browser has 0 matches, an error is thrown.

The [`sauce-browsers`](https://github.com/lpinca/sauce-browsers) dependency has been replaced with [`airtap-sauce-browsers`](https://github.com/airtap/sauce-browsers) and [`airtap-match-browsers`](https://github.com/airtap/match-browsers). This led to a few breaking changes:

<details><summary>Click to expand</summary>

- For mobile browsers, the `platform` field previously mapped to the host OS (Linux or MacOS) that runs the Android emulator or iOS simulator. It now maps to either Android or iOS.
- `name: android` only matches _Android Browser_. Previously it could match both _Android Browser_ and _Chrome for Android_. If both were available on a particular Android version then Sauce Labs would pick _Chrome for Android_. If you want to test in _Chrome for Android_, you must now use `name: and_chr` or its more descriptive alias `chrome for android`.
- iOS browsers have the name `ios_saf` (iOS Safari) rather than `ipad` or `iphone`. For now, Airtap will match the old names for backwards compatibility.

</details>

### Changes to frontend

**TAP output is now parsed in the backend instead of the frontend, with `tap-parser` upgraded from v5 to v10.** Browsers send console logs to the backend over WebSockets, or HTTP in older browsers. Support of IE < 11 has been restored. Stack traces embedded in TAP no longer utilize source maps; we may restore this functionality in a future release.

### Changes to configuration

**A number of options have been renamed:**

<details><summary>Click to expand</summary>

- Replaced the `browser_open_timeout` and `browser_output_timeout / --browser-output-timeout` options with a single `timeout / --timeout` option. It dictates how long to wait for output from a browser. The default is 5 minutes and it accepts strings like "5m" and "10s" to be parsed by [`bruce-millis`](https://www.npmjs.com/package/bruce-millis).
- Renamed `browser_retries / --browser-retries` to `retries / --retries`
- Renamed `prj_dir` to `cwd`

</details>

**A few sauce-only options have moved to `airtap-sauce`:**

<details><summary>Click to expand</summary>

- The `name` option (sets a job name)
- The `capabilities` option
- The `firefox_profile` option (on a browser)
- Options related to the Sauce Connect tunnel

</details>

**Various options have been removed:**

<details><summary>Click to expand</summary>

- `port` (didn't work with parallel browsers)
- `builder` (allowed replacing browserify, but no other bundler could "just work")
- `html` (allowed inserting custom HTML) (you can do this from your tests using DOM)
- `scripts` (allowed loading external scripts) (you can use browserify features and/or plugins to achieve this)
- The command-line flags `--browser-name`, `--browser-version` and `--browser-platform` (incomplete feature, not all browsers have a version and platform).

</details>

**Lastly, Airtap no longer reads `airtap.config.js`.**

### Changes to support server

<details><summary>Click to expand</summary>

- Only one support server is started, for all browsers & tests
- Renamed the `AIRTAP_PORT` environment variable to `AIRTAP_SUPPORT_PORT`
- Removed `window.ZUUL.port` (you can use `window.location.port` instead)
- Stdout of a support server is now piped to stderr; stdout is reserved for TAP
- Removed `serve-static` middleware that served any file in the current working directory. If you need to serve custom files, use a support server.

</details>

## 3.0.0

Dropped support of node < 10.

## 2.0.0

Upgraded browserify from `13.x` to `16.x`, which ends support of IE < 11. If you need IE 9-10, either stick with `airtap@1` or follow the workaround described in [#171](https://github.com/airtap/airtap/issues/171).

## 1.0.0

First stable release. No breaking changes since `0.1.0`. Intended as release line for users needing IE9-10 support; the next major release will only support IE11+ ([#171](https://github.com/airtap/airtap/issues/171)).

## 0.1.0

The `--local [port]` option has been split into two options: `--local` and `--port <port>`. Previously, if you didn't specify a port and `--local` was the last flag, you had to do `--local -- test.js`. This is no longer the case. If you do want to specify a port, you must now do `--local --port 8000`.

The `sauce_connect` option has been removed, as Sauce Connect is the default and only tunnel. You can remove `sauce_connect` from `.airtap.yml` and `--sauce-connect` from command line arguments.

If you used this option to specify a custom tunnel identifier for Sauce Connect (e.g. `--sauce-connect <id>`), you must now do `--tunnel-id <id>` on the command line or `tunnel_id: <id>` in `.airtap.yml`.

## Migrating from Zuul to Airtap 0.0.1

### Installation

```
npm rm zuul --save-dev
npm install airtap --save-dev
```

Rename calls to the `zuul` binary accordingly. If you had this in your `package.json`:

```json
"scripts": {
  "test": "zuul test.js"
}
```

Change it to:

```json
"scripts": {
  "test": "airtap test.js"
}
```

### Configuration

Rename `.zuul.yml` to `.airtap.yml`. If you also have a `~/.zuulrc` for Sauce Labs credentials, rename it to `~/.airtaprc`.

Frameworks other than `tap` and `tape` are no longer supported. You can remove the `--ui` option from your command line arguments and from `.airtap.yml`.

### Tunneling

We removed support of `localtunnel` and `ngrok` in favor of Sauce Connect. Delete any `tunnel`, `disable-tunnel` and `tunnel-host` options from your command line arguments and `.airtap.yml`. Instead add:

```yaml
sauce_connect: true
```

Then enable the Sauce Connect addon in your `.travis.yml`:

```yaml
addons:
  sauce_connect: true
```

It is not yet possible to start Sauce Labs tests from your local machine, unless you manually run the Sauce Connect binary.

### Safari and Edge

Safari and Edge never use a proxy for requests to `localhost`, which means they are not routed through the Sauce Connect tunnel. To support these two browsers, first add the `hosts` addon to your `.travis.yml`:

```yaml
addons:
  sauce_connect: true
  hosts:
    - airtap.local
```

This makes the `airtap.local` hostname resolve to `127.0.0.1`. You can use any hostname you want. Then add this hostname to your `.airtap.yml`:

```yaml
loopback: airtap.local
```

Now Airtap will open the tests at `airtap.local` instead of `localhost` and Safari and Edge properly route requests through Sauce Connect. Happy testing!
