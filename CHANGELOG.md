# Changelog

## [Unreleased]

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

[Unreleased]: https://github.com/airtap/airtap/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/airtap/airtap/compare/v0.0.0...v0.0.1
