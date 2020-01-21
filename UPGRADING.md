# Upgrade Guide

This document describes breaking changes and how to upgrade. For a complete list of changes including minor and patch releases, please refer to the [changelog](CHANGELOG.md).

## Upcoming

### Integrated Sauce Connect

Airtap now includes Sauce Connect. If you were using the Travis Sauce Connect addon, remove it from `.travis.yml`. If you had:

```yaml
addons:
  sauce_connect: true
  hosts:
    - airtap.local
```

Or:

```yaml
addons:
  sauce_connect:
    no_ssl_bump_domains: all
  hosts:
    - airtap.local
```

It should now be:

```yaml
addons:
  hosts:
    - airtap.local
```

### Thinner UI

In favor of parsing TAP in the backend, with `tap-parser` upgraded from v5 to v10. All browsers now send unparsed console logs to the backend over WebSockets (or just HTTP in older browsers) instead of the frontend parsing TAP and varying ways of getting that data to the backend.

Stack traces embedded in TAP no longer utilize source maps; we may restore this functionality in a future release.

Electron gained support for `--coverage`.

### Unified logic

Electron, local and Sauce Labs browsers now have the same logic for timeouts, retries and concurrency. You can test Electron and a local browser in parallel. This exits when both complete:

```
airtap --electron --local --open test.js
```

### Add `--live`

In `--local` mode, airtap now exits by default after the tests complete. To allow repeated runs like before (upon reloading the page) pass the new `--live` flag. This keeps airtap running and works on Electron (and theoretically Sauce Labs browsers) too. If you combine `--electron` and `--live`, the Electron window will be made visible to allow for debugging and reloading.

When browserify errors, airtap exits unless `--live`. Previously, it would hang.

### Changes to configuration

- Removed the `username` and `key` aliases of the `sauce_username` and `sauce_key` options
- Removed the `builder` option (which allowed replacing browserify, but no other bundler could "just work")
- Removed the `html` option (allowed inserting custom HTML) (you can do this from your tests using DOM)
- Removed the `scripts` option (allowed loading external scripts) (you can use browserify features and/or plugins to achieve this)
- Replaced the `browser_open_timeout` and `browser_output_timeout / --browser-output-timeout` options with a single `idle_timeout / --idle-timeout` option. It dictates how long to wait before and between getting output from a browser. The default is 5 minutes and it accepts strings like "5m" and "10s" to be parsed by [`ms`](https://www.npmjs.com/package/ms).

### Changes to support server

- Renamed the `AIRTAP_PORT` environment variable to `AIRTAP_SUPPORT_PORT`
- Removed `window.ZUUL.port` (you can use `window.location.port` instead)
- Stdout of a support server is now piped to stderr; stdout is reserved for TAP
- Removed `serve-static` middleware that served any file in the current working directory. If you need to serve custom files, use a support server.

### Changes to internals

Less likely to affect you.

- Moved start, stop and retry logic to `AbstractBrowser`
- Renamed `shutdown()` to `stop()` (browsers) or `close()` (servers)
- Renamed `init` event to `starting`
- Renamed `passed` and `failed` to `pass` and `fail` (same as `tap-parser`)
- Renamed inconsistent `config` / `opt` / `conf` variables.

## 3.0.0

Dropped support of node < 10.

## 2.0.0

Upgraded browserify from `13.x` to `16.x`, which ends support of IE &lt; 11. If you need IE 9-10, either stick with `airtap@1` or follow the workaround described in [#171](https://github.com/airtap/airtap/issues/171).

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
