# Changelog

## [Unreleased]

## [0.0.3] - 2018-02-24

### Added
* README: add section `"Who Uses Airtap?"` (@feross)
* Test aggregation of available browsers for `--list-browsers` (@ralphtheninja)

### Changed
* Rename `lib/zuul.js` to `lib/airtap.js` (@yeskunall)
* Rename `--list-available-browsers` to `-l/--list-browsers` (@ralphtheninja)
* Replace `char-split` with `split2` (@jeffreyshen19)
* Replace `colors` with `chalk` (@yeskunall)

### Removed
* Remove vim styling and `.editorconfig` (@moondef)
* Remove all frameworks but `tape` (@ralphtheninja)
* Remove `.ui/--ui` option (@ralphtheninja)
* Remove `mocha` dependency (@ralphtheninja)
* Remove references to `emberjs` in docs and change example to use `tape` (@ralphtheninja)

### Fixed
* Fix broken `--list-available-browsers` (@ralphtheninja)

## [0.0.2] - 2018-02-21

### Added
* Add `standard` for linting but only print warnings for now (@feross)
* Add Open Open Source `CONTRIBUTING.md` (@ralphtheninja)

### Changed
* Update [dependencies](https://github.com/airtap/airtap/pull/41) (@ralphtheninja)
* Rename `bin/airtap` to `bin/airtap.js` + fix standard (@ralphtheninja)
* README: fix typo (@0xflotus)
* Replace `xtend` and `shallow-copy` with `Object.assign` (@ralphtheninja)
* Replace `osenv` usage with `os.homedir()` (@yeskunall)
* Make callback in `zuul.run(cb)` call with `cb(err, result)` (@ralphtheninja)

### Removed
* Remove `JSON2` (@ralphtheninja)

**Historical Note** We didn't update `browserify` to the latest version because it doesn't support IE9 or IE10. Nor did we update `tap-parser` to the latest since it doesn't work with `PhantomJS`.

## [0.0.1] - 2018-02-18

First release :seedling:. Forked from [`zuul`](https://github.com/defunctzombie/zuul), so this changelog entry lists the differences from `zuul`.

### Added
* Add `--loopback <hostname>` option for Safari and Edge (@vweevers)
* Add `dependency-check` to npm test script (@ralphtheninja)
* Add `CHANGELOG.md`, `UPGRADING.md` and `LICENSE` (@vweevers)
* Merge zuul wiki into doc folder and readme (@vweevers)
* README: add and update badges (@ralphtheninja, @vweevers)
* README: give credit to Sauce Labs and Zuul (@vweevers)
* README: warn that airtap is unstable (@vweevers)

### Changed
* Replace multi-framework examples with single `tape` example (@vweevers)
* Use Sauce Connect in Sauce Labs integration tests (@vweevers)
* Update `.travis.yml` with node 4, 6, 8 and 9 (@ralphtheninja)
* Use `airtap-browsers` instead of `browzers` (@vweevers)
* Set default `--ui` to tape (@vweevers)

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

[Unreleased]: https://github.com/airtap/airtap/compare/v0.0.3...HEAD
[0.0.3]: https://github.com/airtap/airtap/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/airtap/airtap/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/airtap/airtap/compare/v0.0.0...v0.0.1
