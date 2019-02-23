# Travis CI

Once you have your tests running and passing in the cloud, it is time to setup airtap to run in a continuous integration server. For this we will use [Travis](https://travis-ci.org/) but any of your favorite CI services will work with airtap.

### 1. Getting started

Take a look at the Travis [getting started](http://about.travis-ci.org/docs/user/languages/javascript-with-nodejs/) guide for node.js. Don't worry! Your project doesn't have to be in node.js, we just use that guide to test our javascript.

### 2. Enable the Travis webhook

Visit your [Travis profile](https://travis-ci.org/profile) and make sure the repo you want to test is enabled. This is required before moving on to the next steps.

### 3. Create a .travis.yml config file

Similar to the `.airtap.yml` config file we created for airtap, we need to create a simple file for Travis. In your project directory, open `.travis.yml` with your editor

```yaml
language: node_js
node_js:
  - '8'
```

Copy and paste the above into that file. Yes, we still write node_js even tho our code is for a browser. This is so Travis knows how to test our code.

### 4. Create a package.json file

In order for the above Travis configuration to work, we need to create a file with some meta information about our project. This file is called the `package.json` file and will contain our project name, and how to run airtap. Create and edit the `package.json` file in your project directory.

```json
{
  "name": "<put your project name here>",
  "devDependencies": {
    "airtap": "3.0.0"
  },
  "scripts": {
    "test": "airtap -- test.js"
  }
}
```

That's it! Lets look at the important lines.

* `devDependencies` simply tells [npm](https://npmjs.org) what to install before running tests. Travis will actually do this for us via the `npm install` command in our project directory.
* `scripts` will be run by Travis via the `npm test` command to actually run our tests. Tests will consider passing if this command returns successfully. You can actually test it locally by running `npm test` in your terminal.

### 5. Code coverage (optional)

Code coverage is disabled by default so this step is optional. You opt-in by using the `--coverage` cli option. This will collect code coverage per browser into `.nyc-output/airtap-<hash>.json` in Istanbul 1.0 format. Later you can generate reports by using e.g. `nyc report`, which takes care of merging files from multiple browsers.

In local mode, `airtap` writes to `.nyc-report/airtap-local.json`, so that no cleanup is necessary between repeated runs, e.g. if you refresh the page.

A typical setup in Travis could look like:

```json
{
  "scripts": {
    "test": "airtap --loopback airtap.local --coverage test.js"
  }
}
```

Additionally, you can configure Travis to post the results to `coveralls`:

```yaml
# .travis.yml
after_success: npm run coverage
```

```json
{
  "scripts": {
    "test": "airtap --loopback airtap.local --coverage test.js",
    "coverage": "nyc report --reporter=text-lcov | coveralls"
  }
}
```

### 6. Final step

The final step is very important. Remember how we configured the `.airtaprc` file in our local home directory with our sauce username and key? Well, we need to somehow get those keys to Travis. Again we *don't want to commit cleartext keys* into our repo. Luckily Travis has an awesome feature called [secure environment variables](http://about.travis-ci.org/docs/user/build-configuration/#Secure-environment-variables). This lets us encrypt those environment variables and make them available to our build on Travis.

First, install the `travis` rubygem which will create the encrypted variables. (Alternatively, you can use the [travis-encrypt](https://www.npmjs.com/package/travis-encrypt) if you haven't rubygem).

```shell
gem install travis
```

Once `travis` has installed, run the following commands

```shell
travis encrypt SAUCE_USERNAME=<sauce username> -r <travis-username>/<repo> --add
travis encrypt SAUCE_ACCESS_KEY=<sauce api key> -r <travis-username>/<repo> --add
```

Your `.travis.yml` file will now look something like the following

```yaml
language: node_js
node_js:
- '8'
env:
  global:
  - secure: avoHtpVx6AjEeoTwSESLMryzSzrGLhw4em+lbbheNex3KavITtI+AF6b9FCjMkvaLHz0+ylCQ2773mmXAmUMt9sshpGjwzWziAfz1t6dzb8dxq20r6s+tVQ2Q3p9EhhR+QXvLdCetNzJowbDGpGZV0sYQQzALuXeTaZooDXIsJ4=
  - secure: Hl1SmeCUgpg+QMKJ2gtP1PbtU4s63j6aqpITSECj+Pf0+ByJwWN8GIv3Cm4kOkQH0htYl7RYw6CqyEyVyd4rAogYInftDYbOVgumqKisn1RykgJ0FG7V1FkUpkk+TVFvM84h7DyFFBxTyeLaCSPwXZSm/MaldYk2izWTSQfE/Ek=
```

### Done

Make sure to `git add .airtap.yml .travis.yml package.json`, commit and push your repo. If everything was done right, Travis will be notified of your commit, clone your repo, install airtap, run airtap, and finally tell you if your tests passed or failed!
