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

