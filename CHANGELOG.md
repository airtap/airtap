# Changelog

## [Unreleased]

## [0.0.9] - 2018-07-02

### Changed
* Upgrade `sauce-browsers` from `~1.2.0` to `~2.0.0` (@ralphtheninja)
* Upgrade `commander` from `~2.15.1` to `~2.16.0` (@ralphtheninja)

### Added
* Add `--coverage` cli option to export browser coverage to `.nyc-output/` folder (@vweevers)

### Removed
* Remove `--no-coverage` cli option (@vweevers)
* Remove `--no-instrument` cli option (@vweevers)

## [0.0.8] - 2018-06-27

### Changed
* Do not `watchify` if `process.env.CI` is defined (@ralphtheninja)
* Upgrade `wd` from `~1.7.0` to `~1.10.0` (@ralphtheninja)
* Upgrade `humanize-duration` from `~3.14.0` to `~3.15.0` (@vweevers)
* Upgrade `cross-env` devDependency from `~5.1.3` to `~5.2.0` (@vweevers)
* Upgrade `electron` devDependency from `^1.8.2` to `^2.0.3` (@ralphtheninja)
* Restructure unit tests (@ralphtheninja)
* Rename `Zuul` to `Airtap` (@ralphtheninja)
* Rename `ZuulReporter` to `Reporter` (@ralphtheninja)

### Added
* Add `favicon.ico` (@ralphtheninja, @gorhgorh)

### Removed
* Remove `istanbul-middleware` and disable coverage temporarily (@ralphtheninja)

### Fixed
* Dedup browsers (@ralphtheninja)

## [0.0.7] - 2018-05-25

### Changed
* Update `airtap-browser` to `0.0.2` (@ralphtheninja)
* Update dependencies to enable Greenkeeper (includes `wd` fix) (@feross, @greenkeeper)

### Removed
* Remove support for `PhantomJS` (@ralphtheninja)

## [0.0.6] - 2018-05-24

### Changed
* Replace Sauce Labs png with svg (@vweevers)

### Fixed
* Don't watch `node_modules/` folder (@vweevers)

## [0.0.5] - 2018-05-05

### Changed
* Refactor `lib/get-saucelabs-browser.js` and `lib/flatten-browserlist.js` by using `sauce-browsers` module (@lpinca)
* Rename `status` and `results` to `stats` for consistency (@vweevers)
* Terminate connections by using `server-destroy` module (@vweevers)
* Clean up `ZuulReporter` (@vweevers)
* Rename `SauceBrowser#browser` to `webdriver` (@vweevers)
* Introduce `AbstractBrowser` (@vweevers)
* Clean up tests and only run sauce tests on Travis (@ralphtheninja)
* Rename `frameworks/` to `client/` (@ralphtheninja)
* Move `.stats` to `AbstractBrowser` (@ralphtheninja)
* Prefer `debug()` over `console.log()` (@vweevers)
* Clean up `zuul` naming (@ralphtheninja)

### Added
* Add `test-local-electron` script (@vweevers)
* Test `AbstractBrowser` and implementations (@vweevers)
* Add node 10 to Travis (@ralphtheninja)

### Removed
* Remove unused `tags` option (@vweevers)

### Fixed
* Fix cli test on windows (@vweevers)

## [0.0.4] - 2018-03-02

### Changed
* Setup email for Travis builds (@yeskunall)
* Normalize file names (@yeskunall)
* Finalize `standard` (@ralphtheninja)
* Depend on `electron` instead of deprecated `electron-prebuilt` (@ralphtheninja)
* Throw error instead of error message (@arungalva)
* Refactor opt/config variable in `setup.js` (@ralphtheninja)
* Replace IIFE with normal function declaration and function call (@ralphtheninja)
* Run unit tests before integration tests and put the sauce labs integration last (@ralphtheninja)
* Update keywords in `package.json` (@yeskunall)
* Update `dependency-check` to `^3.0.0` (@yeskunall)
* Exit cleanly if Travis has no secure environment variables (@ralphtheninja)
* Clean up entries in `dependency-check` (@ralphtheninja)

### Added
* Test electron browser (@ralphtheninja)
* README: add `stream-http` to list of users (@jhiesey)

### Removed
* Remove support for older Electron api (@ralphtheninja)
* Remove support for node 4 (@ralphtheninja)

### Fixed
* Fix race condition in electron ipc (@ralphtheninja)
* Add debug statement instead of silently failing Sauce Labs (@arungalva)

## [0.0.3] - 2018-02-24

### Changed
* Rename `lib/zuul.js` to `lib/airtap.js` (@yeskunall)
* Rename `--list-available-browsers` to `-l/--list-browsers` (@ralphtheninja)
* Replace `char-split` with `split2` (@jeffreyshen19)
* Replace `colors` with `chalk` (@yeskunall)

### Added
* README: add section `"Who Uses Airtap?"` (@feross)
* Test aggregation of available browsers for `--list-browsers` (@ralphtheninja)

### Removed
* Remove vim styling and `.editorconfig` (@moondef)
* Remove all frameworks but `tape` (@ralphtheninja)
* Remove `.ui/--ui` option (@ralphtheninja)
* Remove `mocha` dependency (@ralphtheninja)
* Remove references to `emberjs` in docs and change example to use `tape` (@ralphtheninja)

### Fixed
* Fix broken `--list-available-browsers` (@ralphtheninja)

## [0.0.2] - 2018-02-21

### Changed
* Update [dependencies](https://github.com/airtap/airtap/pull/41) (@ralphtheninja)
* Rename `bin/airtap` to `bin/airtap.js` + fix standard (@ralphtheninja)
* README: fix typo (@0xflotus)
* Replace `xtend` and `shallow-copy` with `Object.assign` (@ralphtheninja)
* Replace `osenv` usage with `os.homedir()` (@yeskunall)
* Make callback in `zuul.run(cb)` call with `cb(err, result)` (@ralphtheninja)

### Added
* Add `standard` for linting but only print warnings for now (@feross)
* Add Open Open Source `CONTRIBUTING.md` (@ralphtheninja)

### Removed
* Remove `JSON2` (@ralphtheninja)

**Historical Note** We didn't update `browserify` to the latest version because it doesn't support IE9 or IE10. Nor did we update `tap-parser` to the latest since it doesn't work with `PhantomJS`.

## [0.0.1] - 2018-02-18

First release :seedling:. Forked from [`zuul`](https://github.com/defunctzombie/zuul), so this changelog entry lists the differences from `zuul`.

### Changed
* Replace multi-framework examples with single `tape` example (@vweevers)
* Use Sauce Connect in Sauce Labs integration tests (@vweevers)
* Update `.travis.yml` with node 4, 6, 8 and 9 (@ralphtheninja)
* Use `airtap-browsers` instead of `browzers` (@vweevers)
* Set default `--ui` to tape (@vweevers)

### Added
* Add `--loopback <hostname>` option for Safari and Edge (@vweevers)
* Add `dependency-check` to npm test script (@ralphtheninja)
* Add `CHANGELOG.md`, `UPGRADING.md` and `LICENSE` (@vweevers)
* Merge zuul wiki into doc folder and readme (@vweevers)
* README: add and update badges (@ralphtheninja, @vweevers)
* README: give credit to Sauce Labs and Zuul (@vweevers)
* README: warn that airtap is unstable (@vweevers)

### Fixed
* Use `cross-env` in npm test script (@vweevers)

### Removed
* Remove `localtunnel`, `ngrok` and tunnel setup (@vweevers)
* Remove tunnel options except for `--sauce-connect` (@vweevers)
* Remove tunnel options from PhantomJS tests (runs locally) (@vweevers)
* Remove `.npmrc` (@ralphtheninja)
* README: remove frameworks other than tap(e) (@vweevers)
* Undocument `--ui` option (we intend to remove it) (@vweevers)
* Remove `HISTORY.md` (replaced by `CHANGELOG.md`) (@vweevers)

[Unreleased]: https://github.com/airtap/airtap/compare/v0.0.9...HEAD
[0.0.9]: https://github.com/airtap/airtap/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/airtap/airtap/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/airtap/airtap/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/airtap/airtap/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/airtap/airtap/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/airtap/airtap/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/airtap/airtap/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/airtap/airtap/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/airtap/airtap/compare/v0.0.0...v0.0.1
