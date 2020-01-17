# Changelog

If you are upgrading or migrating from [Zuul](https://github.com/defunctzombie/zuul): please see the [upgrade guide](./UPGRADING.md).

## [3.0.0] - 2020-01-17

### Changed

- Upgrade `wd` from `~1.11.1` to `~1.12.0` ([#271](https://github.com/airtap/airtap/issues/271)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `chalk` from `^2.3.1` to `^3.0.0` ([#270](https://github.com/airtap/airtap/issues/270)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `commander` from `~3.0.0` to `~4.0.0` ([#268](https://github.com/airtap/airtap/issues/268)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `convert-source-map` from `~1.6.0` to `~1.7.0` ([#269](https://github.com/airtap/airtap/issues/269)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `http-proxy` from `~1.17.0` to `~1.18.0` ([#265](https://github.com/airtap/airtap/issues/265)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `humanize-duration` from `~3.20.0` to `~3.21.0` ([#266](https://github.com/airtap/airtap/issues/266)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `electron` devDependency from `^6.0.0` to `^7.1.8` ([#267](https://github.com/airtap/airtap/issues/267)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `cross-env` devDependency from `^5.2.0` to `^6.0.0` ([#264](https://github.com/airtap/airtap/issues/264)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `hallmark` devDependency from `^1.0.0` to `^2.0.0` ([#263](https://github.com/airtap/airtap/issues/263)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `standard` devDependency from `^13.0.1` to `^14.0.0` ([#262](https://github.com/airtap/airtap/issues/262)) ([**@vweevers**](https://github.com/vweevers))

### Removed

- **Breaking:** Drop node &lt; 10 ([#272](https://github.com/airtap/airtap/issues/272)) ([**@vweevers**](https://github.com/vweevers))

## [2.0.4] - 2019-08-17

### Changed

- Upgrade `browserify` from `~16.3.0` to `~16.5.0` ([#258](https://github.com/airtap/airtap/issues/258), [#260](https://github.com/airtap/airtap/issues/260)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `commander` from `~2.20.0` to `~3.0.0` ([#259](https://github.com/airtap/airtap/issues/259)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `shell-quote` from `~1.6.1` to `~1.7.0` ([#261](https://github.com/airtap/airtap/issues/261)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `humanize-duration` from `~3.19.0` to `~3.20.0` ([#254](https://github.com/airtap/airtap/issues/254)) ([**@vweevers**](https://github.com/vweevers))
- Use `xvfb` service in Travis ([#258](https://github.com/airtap/airtap/issues/258)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `dependency-check` devDependency from `^3.0.0` to `^4.0.0` ([#256](https://github.com/airtap/airtap/issues/256)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `electron` devDependency from `^5.0.6` to `^6.0.0` ([#257](https://github.com/airtap/airtap/issues/257)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `hallmark` devDependency from `^0.1.0` to `^1.0.0` ([#253](https://github.com/airtap/airtap/issues/253)) ([**@vweevers**](https://github.com/vweevers))

## [2.0.3] - 2019-07-12

### Changed

- Upgrade `humanize-duration` from `~3.16.0` to `~3.19.0` ([#243](https://github.com/airtap/airtap/issues/243), [#250](https://github.com/airtap/airtap/issues/250)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `browserify` from `~16.2.3` to `~16.3.0` ([#249](https://github.com/airtap/airtap/issues/249)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `express` from `~4.16.2` to `~4.17.0` ([#248](https://github.com/airtap/airtap/issues/248)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `body-parser` from `~1.18.3` to `~1.19.0` ([#247](https://github.com/airtap/airtap/issues/247)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `commander` from `~2.19.0` to `~2.20.0` ([#245](https://github.com/airtap/airtap/issues/245)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `electron` devDependency from `^2.0.3` to `^5.0.6` ([`3abef6f`](https://github.com/airtap/airtap/commit/3abef6f), [#252](https://github.com/airtap/airtap/issues/252)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `standard` devDependency from `^12.0.0` to `^13.0.1` ([#251](https://github.com/airtap/airtap/issues/251)) ([**@vweevers**](https://github.com/vweevers))
- Ignore `highlight.js` in Greenkeeper ([`1653fda`](https://github.com/airtap/airtap/commit/1653fda)) ([**@vweevers**](https://github.com/vweevers))
- Ignore `tap-parser` in Greenkeeper ([#244](https://github.com/airtap/airtap/issues/244)) ([**@goto-bus-stop**](https://github.com/goto-bus-stop))
- Unlock devDependencies ([`dee0f88`](https://github.com/airtap/airtap/commit/dee0f88)) ([**@vweevers**](https://github.com/vweevers))

## [2.0.2] - 2019-02-23

### Removed

- Remove outdated `doc/travis-matrix.md` ([#197](https://github.com/airtap/airtap/issues/197)) ([`24f3022`](https://github.com/airtap/airtap/commit/24f3022)) ([**@vweevers**](https://github.com/vweevers))

### Fixed

- Fix Android 8.x (and future versions) ([#240](https://github.com/airtap/airtap/issues/240)) ([`ea1df9e`](https://github.com/airtap/airtap/commit/ea1df9e)) ([**@vweevers**](https://github.com/vweevers))

## [2.0.1] - 2018-12-29

### Changed

- Upgrade `airtap-browsers` devDependency from `^0.1.0` to `^0.2.0` ([#235](https://github.com/airtap/airtap/issues/235)) ([**@vweevers**](https://github.com/vweevers))

### Fixed

- Fix Android 7.x with `deviceName` workaround ([#235](https://github.com/airtap/airtap/issues/235)) ([**@vweevers**](https://github.com/vweevers))

## [2.0.0] - 2018-12-29

### Changed

- Update `browserify` from `~13.3.0` to `~16.2.3` ([#233](https://github.com/airtap/airtap/issues/233)) ([**@vweevers**](https://github.com/vweevers))
- Update `airtap-browsers` devDependency from `0.0.2` to `^0.1.0` ([#233](https://github.com/airtap/airtap/issues/233)) ([**@vweevers**](https://github.com/vweevers))

## [1.0.0] - 2018-12-27

### Changed

- Replace `superagent` with `xhr` ([#231](https://github.com/airtap/airtap/issues/231)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `convert-source-map` from `~1.5.1` to `~1.6.0` ([#218](https://github.com/airtap/airtap/issues/218)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `wd` from `~1.10.0` to `~1.11.1` ([#230](https://github.com/airtap/airtap/issues/230)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `humanize-duration` from `~3.15.0` to `~3.16.0` ([#229](https://github.com/airtap/airtap/issues/229)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `commander` from `~2.16.0` to `~2.19.0` ([#212](https://github.com/airtap/airtap/issues/212), [#219](https://github.com/airtap/airtap/issues/219), [#225](https://github.com/airtap/airtap/issues/225)) ([**@vweevers**](https://github.com/vweevers), [**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `debug` from `~3.1.0` to `~4.1.0` ([#220](https://github.com/airtap/airtap/issues/220), [#221](https://github.com/airtap/airtap/issues/221), [#224](https://github.com/airtap/airtap/issues/224)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `firefox-profile` from `~1.1.0` to `~1.2.0` ([#216](https://github.com/airtap/airtap/issues/216)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `split2` from `^2.2.0` to `^3.0.0` ([#214](https://github.com/airtap/airtap/issues/214)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `opener` from `~1.4.3` to `~1.5.0` ([#215](https://github.com/airtap/airtap/issues/215)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `through2` devDependency from `^2.0.3` to `^3.0.0` ([#227](https://github.com/airtap/airtap/issues/227)) ([**@vweevers**](https://github.com/vweevers))
- Upgrade `standard` devDependency from `^11.0.0` to `^12.0.0` ([#217](https://github.com/airtap/airtap/issues/217)) ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `readable-stream` to list of users ([#213](https://github.com/airtap/airtap/issues/213)) ([**@mcollina**](https://github.com/mcollina))
- Add `hallmark` ([**@vweevers**](https://github.com/vweevers))

## [0.1.0] - 2018-07-07

### Changed

- Ignore `--loopback` in local mode and Electron ([#77](https://github.com/airtap/airtap/issues/77)) ([**@vweevers**](https://github.com/vweevers))
- Split `--local [port]` into `--local` and `--port <port>` ([#198](https://github.com/airtap/airtap/issues/198)) ([**@vweevers**](https://github.com/vweevers))

### Added

- Add `--tunnel-id` option ([**@vweevers**](https://github.com/vweevers))

### Removed

- Remove code coverage tab ([#202](https://github.com/airtap/airtap/issues/202)) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `--sauce-connect` option ([**@vweevers**](https://github.com/vweevers))

### Fixed

- Adjust release date for `0.0.9` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Increase maximum body size for posting code coverage ([#200](https://github.com/airtap/airtap/issues/200)) ([**@vweevers**](https://github.com/vweevers))

## [0.0.9] - 2018-07-04

### Changed

- Upgrade `sauce-browsers` from `~1.2.0` to `~2.0.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `commander` from `~2.15.1` to `~2.16.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Allow for retries in integration test ([**@vweevers**](https://github.com/vweevers))

### Added

- Add `--coverage` cli option to export browser coverage to `.nyc-output/` folder ([**@vweevers**](https://github.com/vweevers))

### Removed

- Remove `--no-coverage` cli option ([**@vweevers**](https://github.com/vweevers))
- Remove `--no-instrument` cli option ([**@vweevers**](https://github.com/vweevers))

## [0.0.8] - 2018-06-27

### Changed

- Do not `watchify` if `process.env.CI` is defined ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `wd` from `~1.7.0` to `~1.10.0` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Upgrade `humanize-duration` from `~3.14.0` to `~3.15.0` ([**@vweevers**](https://github.com/vweevers))
- Upgrade `cross-env` devDependency from `~5.1.3` to `~5.2.0` ([**@vweevers**](https://github.com/vweevers))
- Upgrade `electron` devDependency from `^1.8.2` to `^2.0.3` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Restructure unit tests ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Rename `Zuul` to `Airtap` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Rename `ZuulReporter` to `Reporter` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `favicon.ico` ([**@ralphtheninja**](https://github.com/ralphtheninja), [**@gorhgorh**](https://github.com/gorhgorh))

### Removed

- Remove `istanbul-middleware` and disable coverage temporarily ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Dedup browsers ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.0.7] - 2018-05-25

### Changed

- Update `airtap-browser` to `0.0.2` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Update dependencies to enable Greenkeeper (includes `wd` fix) ([**@feross**](https://github.com/feross), [**@greenkeeper**](https://github.com/greenkeeper))

### Removed

- Remove support for `PhantomJS` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.0.6] - 2018-05-24

### Changed

- Replace Sauce Labs png with svg ([**@vweevers**](https://github.com/vweevers))

### Fixed

- Don't watch `node_modules/` folder ([**@vweevers**](https://github.com/vweevers))

## [0.0.5] - 2018-05-05

### Changed

- Refactor `lib/get-saucelabs-browser.js` and `lib/flatten-browserlist.js` by using `sauce-browsers` module ([**@lpinca**](https://github.com/lpinca))
- Rename `status` and `results` to `stats` for consistency ([**@vweevers**](https://github.com/vweevers))
- Terminate connections by using `server-destroy` module ([**@vweevers**](https://github.com/vweevers))
- Clean up `ZuulReporter` ([**@vweevers**](https://github.com/vweevers))
- Rename `SauceBrowser#browser` to `webdriver` ([**@vweevers**](https://github.com/vweevers))
- Introduce `AbstractBrowser` ([**@vweevers**](https://github.com/vweevers))
- Clean up tests and only run sauce tests on Travis ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Rename `frameworks/` to `client/` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Move `.stats` to `AbstractBrowser` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Prefer `debug()` over `console.log()` ([**@vweevers**](https://github.com/vweevers))
- Clean up `zuul` naming ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `test-local-electron` script ([**@vweevers**](https://github.com/vweevers))
- Test `AbstractBrowser` and implementations ([**@vweevers**](https://github.com/vweevers))
- Add node 10 to Travis ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove unused `tags` option ([**@vweevers**](https://github.com/vweevers))

### Fixed

- Fix cli test on windows ([**@vweevers**](https://github.com/vweevers))

## [0.0.4] - 2018-03-02

### Changed

- Setup email for Travis builds ([**@yeskunall**](https://github.com/yeskunall))
- Normalize file names ([**@yeskunall**](https://github.com/yeskunall))
- Finalize `standard` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Depend on `electron` instead of deprecated `electron-prebuilt` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Throw error instead of error message ([**@arungalva**](https://github.com/arungalva))
- Refactor opt/config variable in `setup.js` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Replace IIFE with normal function declaration and function call ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Run unit tests before integration tests and put the sauce labs integration last ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Update keywords in `package.json` ([**@yeskunall**](https://github.com/yeskunall))
- Update `dependency-check` to `^3.0.0` ([**@yeskunall**](https://github.com/yeskunall))
- Exit cleanly if Travis has no secure environment variables ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Clean up entries in `dependency-check` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Test electron browser ([**@ralphtheninja**](https://github.com/ralphtheninja))
- README: add `stream-http` to list of users ([**@jhiesey**](https://github.com/jhiesey))

### Removed

- Remove support for older Electron api ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove support for node 4 ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Fix race condition in electron ipc ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add debug statement instead of silently failing Sauce Labs ([**@arungalva**](https://github.com/arungalva))

## [0.0.3] - 2018-02-24

### Changed

- Rename `lib/zuul.js` to `lib/airtap.js` ([**@yeskunall**](https://github.com/yeskunall))
- Rename `--list-available-browsers` to `-l/--list-browsers` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Replace `char-split` with `split2` ([**@jeffreyshen19**](https://github.com/jeffreyshen19))
- Replace `colors` with `chalk` ([**@yeskunall**](https://github.com/yeskunall))

### Added

- README: add section `"Who Uses Airtap?"` ([**@feross**](https://github.com/feross))
- Test aggregation of available browsers for `--list-browsers` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove vim styling and `.editorconfig` ([**@moondef**](https://github.com/moondef))
- Remove all frameworks but `tape` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `.ui/--ui` option ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove `mocha` dependency ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Remove references to `emberjs` in docs and change example to use `tape` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Fixed

- Fix broken `--list-available-browsers` ([**@ralphtheninja**](https://github.com/ralphtheninja))

## [0.0.2] - 2018-02-21

### Changed

- Update [dependencies](https://github.com/airtap/airtap/pull/41) ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Rename `bin/airtap` to `bin/airtap.js` + fix standard ([**@ralphtheninja**](https://github.com/ralphtheninja))
- README: fix typo ([**@0xflotus**](https://github.com/0xflotus))
- Replace `xtend` and `shallow-copy` with `Object.assign` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Replace `osenv` usage with `os.homedir()` ([**@yeskunall**](https://github.com/yeskunall))
- Make callback in `zuul.run(cb)` call with `cb(err, result)` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Added

- Add `standard` for linting but only print warnings for now ([**@feross**](https://github.com/feross))
- Add Open Open Source `CONTRIBUTING.md` ([**@ralphtheninja**](https://github.com/ralphtheninja))

### Removed

- Remove `JSON2` ([**@ralphtheninja**](https://github.com/ralphtheninja))

**Historical Note** We didn't update `browserify` to the latest version because it doesn't support IE9 or IE10. Nor did we update `tap-parser` to the latest since it doesn't work with `PhantomJS`.

## [0.0.1] - 2018-02-18

First release :seedling:. Forked from [`zuul`](https://github.com/defunctzombie/zuul), so this changelog entry lists the differences from `zuul`.

### Changed

- Replace multi-framework examples with single `tape` example ([**@vweevers**](https://github.com/vweevers))
- Use Sauce Connect in Sauce Labs integration tests ([**@vweevers**](https://github.com/vweevers))
- Update `.travis.yml` with node 4, 6, 8 and 9 ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Use `airtap-browsers` instead of `browzers` ([**@vweevers**](https://github.com/vweevers))
- Set default `--ui` to tape ([**@vweevers**](https://github.com/vweevers))

### Added

- Add `--loopback <hostname>` option for Safari and Edge ([**@vweevers**](https://github.com/vweevers))
- Add `dependency-check` to npm test script ([**@ralphtheninja**](https://github.com/ralphtheninja))
- Add `CHANGELOG.md`, `UPGRADING.md` and `LICENSE` ([**@vweevers**](https://github.com/vweevers))
- Merge zuul wiki into doc folder and readme ([**@vweevers**](https://github.com/vweevers))
- README: add and update badges ([**@ralphtheninja**](https://github.com/ralphtheninja), [**@vweevers**](https://github.com/vweevers))
- README: give credit to Sauce Labs and Zuul ([**@vweevers**](https://github.com/vweevers))
- README: warn that airtap is unstable ([**@vweevers**](https://github.com/vweevers))

### Fixed

- Use `cross-env` in npm test script ([**@vweevers**](https://github.com/vweevers))

### Removed

- Remove `localtunnel`, `ngrok` and tunnel setup ([**@vweevers**](https://github.com/vweevers))
- Remove tunnel options except for `--sauce-connect` ([**@vweevers**](https://github.com/vweevers))
- Remove tunnel options from PhantomJS tests (runs locally) ([**@vweevers**](https://github.com/vweevers))
- Remove `.npmrc` ([**@ralphtheninja**](https://github.com/ralphtheninja))
- README: remove frameworks other than tap(e) ([**@vweevers**](https://github.com/vweevers))
- Undocument `--ui` option (we intend to remove it) ([**@vweevers**](https://github.com/vweevers))
- Remove `HISTORY.md` (replaced by `CHANGELOG.md`) ([**@vweevers**](https://github.com/vweevers))

[3.0.0]: https://github.com/airtap/airtap/compare/v2.0.4...v3.0.0

[2.0.4]: https://github.com/airtap/airtap/compare/v2.0.3...v2.0.4

[2.0.3]: https://github.com/airtap/airtap/compare/v2.0.2...v2.0.3

[2.0.2]: https://github.com/airtap/airtap/compare/v2.0.1...v2.0.2

[2.0.1]: https://github.com/airtap/airtap/compare/v2.0.0...v2.0.1

[2.0.0]: https://github.com/airtap/airtap/compare/v1.0.0...v2.0.0

[1.0.0]: https://github.com/airtap/airtap/compare/v0.1.0...v1.0.0

[0.1.0]: https://github.com/airtap/airtap/compare/v0.0.9...v0.1.0

[0.0.9]: https://github.com/airtap/airtap/compare/v0.0.8...v0.0.9

[0.0.8]: https://github.com/airtap/airtap/compare/v0.0.7...v0.0.8

[0.0.7]: https://github.com/airtap/airtap/compare/v0.0.6...v0.0.7

[0.0.6]: https://github.com/airtap/airtap/compare/v0.0.5...v0.0.6

[0.0.5]: https://github.com/airtap/airtap/compare/v0.0.4...v0.0.5

[0.0.4]: https://github.com/airtap/airtap/compare/v0.0.3...v0.0.4

[0.0.3]: https://github.com/airtap/airtap/compare/v0.0.2...v0.0.3

[0.0.2]: https://github.com/airtap/airtap/compare/v0.0.1...v0.0.2

[0.0.1]: https://github.com/airtap/airtap/compare/v0.0.0...v0.0.1
