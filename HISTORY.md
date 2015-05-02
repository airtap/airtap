# 3.0.0 (2015-05-02)

* Builder API change #182
* Specify http tarball url for stacktracejs to be compatible with node 0.10 npms #188
* Add support for config through js (67980)
* Fix jasmin client to report errors correctly
* Add electron support (9d0468)
* Add `wait` field to .zuul.yml for delayed user_server start (e093664)

# 2.1.1 (2015-03-09)

* use `appium-version` 1.3.6, reduces mobile/safari startup fails

# 2.1.0 (2015-03-04)

* Fixed JS error on the zuul page in old IEs that don't have `JSON.parse`
* The `--list-available-browsers` flag now produces nicer output
* Increased SauceLabs timeouts and retries
* Fixed a global leak possibly causing `Not running` errors
* Forcing appium version to avoid possible mobile platform issues
* Browser versions ending in `.0` now work without quotes, e.g., `8.0`
* The `--phantom` flag accepts an optional port argument that forces phantomjs to use the specified port
* SauceBrowser debug prints now have browser name and version available in the debug name

# 2.0.0 (2015-02-24)

* Fixed a bug in detecting the termination of tape test runs
* Watchify is used to cache browerify bundles to accelerate local development with Zuul
* Bumped browserify version to 9.0.3
* Command line options now always trump .zuul.yml and .zuulrc configuration
* Added a `--disable-tunnel` flag to disable any tunnel configuration set in the config files

# 1.19.0 (2015-02-18)

* Fixes to corner cases of the tape test runner
* Fixed failed browser count in console output
* Exposed the support server port in tests through `ZUUL.port`

# 1.18.1 (2015-02-13)

* tape: close stream only after full summary

# 1.18.0 (2015-02-12)

* Added support for jasmine2 with `--ui jasmine2`

# 1.17.2 (2015-02-11)

* Browserify transform options can now be specified in .zuul.yml
* The istanbul transform is now added after custom browserify transforms to avoid instrumentation issues

# 1.17.1 (2015-02-02)

* `SauceBrowser` now properly uses the tunnel config option from .zuul.yml

# 1.17.0 (2015-01-30)

* running tests on a browser on multiple platforms is now supported, e.g., `platform: [Linux, Windows 2012]`
* zuul can now use other tunnels in addition to localtunnel through the `--tunnel` option
  see the [module page](https://github.com/rase-/zuul-ngrok) for more details
* tunnel configuration can now be added in a `tunnel` key in .zuul.yml
* code coverage is now recorded through an istanbul integration

# 1.16.5 (2015-01-18)

* fix tape console.log bug with multiple arguments

# 1.16.4 (2015-01-10)

* wait for browser quit before closing saucelabs browser

# 1.16.3 (2014-12-24)

* fix tape issue for write after end

# 1.16.2 (2014-12-21)

* avoid failing when closing sauce browser

# 1.16.1 (2014-12-20)

* reset stats on restart

# 1.16.0 (2014-12-10)

* add concurrency CLI option
* retry logic if saucelabs browser fails (more robust testing)

# 1.15.2 (2014-12-04)

* fix browserify config options

# 1.15.1 (2014-12-03)

* fix builder browserify

# 1.15.0 (2014-12-03)

* add config options for browserify to zuul.yml
* add config option for server cwd
* add --open option to the CLI

# 1.14.0 (2014-11-26)

* tweak zuul_msg_bus message fetching
* add empty framework.js file for tape

# 1.13.0 (2014-10-29)

* upgrade to browserify v6

# 1.12.0 (2014-10-26)

 * upgrade requests handled better for local server
 * search for .zuulrc in project root before $HOME

# 1.11.2 (2014-10-09)

 * update bouncy to 3.2.2 (fix large data to support server)

# 1.11.1 (2014-10-08)

 * better sauce labs non number range parsing

# 1.11.0 (2014-09-14)

 * add --sauce-connect option to use sauce connect instead of localtunnel
 * fix version range parsing to properly handle 'beta'
 * add --list-available-browsers CLI option
 * support ##..beta in version ranges along with ##..latest (latest does not imply beta)

# 1.10.2 (2014-08-24)

  * add --browser-<name,version,platform> flags to override browser launching

# 1.10.1 (2014-08-07)

  * ignore non-numeric browser versions when parsing for version ranges

# 1.10.0 (2014-07-22)

  * update browserify to 4.2.3

# 1.9.0 (2014-07-11)

  * configurable localtunnel server
  * specify `capabilities` in zuul.yml
  * add config option to specify firefox extensions

# 1.8.0 (2014-07-03)

  * remove mocha peer dep
  * exit with failure if no tests passed
  * don't crash for unknown platforms
  * use better method to get open ports
  * add firefox_profile config option

