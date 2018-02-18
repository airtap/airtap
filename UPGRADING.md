# Upgrade Guide

This document describes breaking changes and how to upgrade. For a complete list of changes including minor and patch releases, please refer to the [changelog](CHANGELOG.md).

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
