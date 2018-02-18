# Cloud testing

Once you have your tests running locally in your browser, it is time to run them across a range of other browsers and systems. This way you can be sure your code works in the browsers you wish to support.

For our cloud testing we will leverage [Sauce Labs](https://saucelabs.com/home) to run our same tests in the browser.

### 1. Get a Sauce Labs account

If you already have a Sauce Labs account you can skip this step.

Open source projects can use the awesome [free for open source](https://saucelabs.com/opensauce) version of Sauce Labs. If your project is backed by a company, please consider getting one of their paid accounts. Closed source projects always require a paid account.

### 2. Educate airtap

To run your tests in the cloud, airtap needs to know your Sauce Labs credentials (username and api key). Obviously you don't want to expose these in your repo so airtap has a better way: a [config file](./airtaprc.md) in your home directory.

Open `~/.airtaprc` with your favorite editor and make it look like the following:

```yaml
sauce_username: my_awesome_username
sauce_key: 550e8400-e29b-41d4-a716-446655440000
```

Obviously replace with your name and key from your account. See [airtaprc](./airtaprc.md) for more more details about this file.

### 3. Select browsers to test

Back in your project directory (not your home directory where we put the airtaprc file), add the following file `.airtap.yml`

```yaml
browsers:
  - name: chrome
    version: 27..latest
  - name: ie
    version: latest
  - name: iphone
    version: 6.1
```

This will run our tests on `chrome`, `iphone`, and `internet explore` browsers. Take note of how versions can be specified. You can specify a specific number (safari example), use the special keyword `latest` to test the latest version (airtap will auto detect it), or specify a range using `..` to test all available versions including the range bounds. When using float version numbers that end in `.0` or that involve ranges you should add single quotes around them, like so: `version: '6.0'` or `version: '6.1..7.1'`.

For chrome and firefox, you can also use `version: 39..dev` to even test stable, beta and dev channels.

An available list of browsers can be found here https://saucelabs.com/docs/platforms and the JSON
airtap reads is here: https://saucelabs.com/rest/v1/info/browsers/webdriver. You can also list the browsers directly on the command line with the `--list-available-browsers` flag.

See [airtap.yml](./airtap.yml.md) for other valid fields and examples.

See the available browsers by using:

```shell
airtap --list-available-browsers
```

### 4. Run airtap

We are now ready to run our tests in the cloud. Simply run airtap without the `--local` flag.

```shell
airtap test.js
```

Airtap will create a server, establish a tunnel so Sauce Labs can find our tests, and then ask Sauce Labs to run your tests. You can open your [Sauce Labs dashboard](https://saucelabs.com/account) to see tests being run and their results. Airtap will exit when all tests are done.

## Done

Once you are happy with your Sauce Labs tests (all passing I hope), you are ready to hook up the last piece: [Travis CI](./travis-ci.md).
