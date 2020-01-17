# Upgrade Guide

This document describes breaking changes and how to upgrade. For a complete list of changes including minor and patch releases, please refer to the [changelog](CHANGELOG.md).

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
