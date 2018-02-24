# .airtap.yml

The `.airtap.yml` file lives in each project directory and contains per-project test settings.

## fields

### browsers (required)

List of browsers to test in the cloud. Each entry starts with a `- name` field and must contain a `version` field and an optional `platform` field. If the platform field is omitted, a default platform will be selected.

A browser version can be a specific version number, the keyword `latest`, the keyword `oldest`, or (for Firefox and Chrome) one of the keywords `beta`  or `dev`.

```yaml
browsers:
  - name: chrome
    version: latest
  - name: safari
    version: latest
```

#### Specific version of a browser on a specific platform

```yaml
browsers:
  - name: chrome
    version: 28
    platform: Windows XP
```

#### Range of versions of a browser

```yaml
browsers:
  - name: firefox
    version: 14..latest
```

#### Range of versions with negative start index.

This example would test the latest three stable versions of Firefox (latest - 2, latest - 1, latest).

``` yaml
browsers:
  - name: firefox
    version: -2..latest
```

#### Disjoint versions

```yaml
browsers:
  - name: firefox
    version: [19, 20]
```

#### Disjoint with ranges

```yaml
browsers:
  - name: firefox
    version: [19, 20, 23..latest]
  - name: chrome
    version: [-1..latest, beta]
```

#### Float version numbers

```yaml
browsers:
  - name: iPhone
    version: '8.0..latest'
```

Float version numbers should be quoted.

### html (optional)

The `html` field allows you to inject custom html into the page. This is useful for testing app frameworks where you might want to specify some custom template logic. The html is inserted at the start of the body.

```yaml
html: ./test/templates.html
```

### scripts (optional)

A list of files or url to load into `<script>` tags on the page before tests run. This would be used to load jquery or other globals if your module and test code is not self contained.

```yaml
scripts:
  - "http://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.js"
  - "http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.0.0/handlebars.min.js"
  - "http://builds.emberjs.com/tags/v1.2.0-beta.1/ember.js"
  - "app.js"
```

### browserify (optional)

You can set any of the configuration elements in the list below, and they'll be passed to `browserify`.

- `plugin`
- `external`
- `ignore`
- `exclude`
- `transform`
- `add`
- `require`

You can pass options to any of them, and you can use multiples as the configuration object is treated as an array!

```yaml
browserify:
  - plugin: proxyquire-universal
  - require: ./some-file.js
    expose: intimidate
    entry: true
  - external: ./some-module.js
  - transform: brfs
  - transform: jadeify
```

You can also configure what's passed as the `opts` to `browserify(opts)` by adding an item with the `options` property.

```yaml
browserify:
  - transform: coffeeify
  - options:
      extensions:
        - .js
        - .json
        - .coffee
```

Transform options can also be provided like so:

```yaml
browserify:
  - transform:
      name: reactify
      es6: true # option passed to reactify
  - transform: 6to5ify
```

### server (optional)

This field can point to an optional shell command or javascript file to run as a testing support server. This is used to make testing with real ajax and websocket requests possible. Your command will be run with the `AIRTAP_PORT` environment variable set to a port number you MUST use. If your server does not listen on this PORT then your test requests won't be able to reach it.

```yaml
server: ./test/support/server.js
```

We recommend writing simple support servers using [expressjs](http://expressjs.com/). However, any shell command will be run so servers in ruby, python, etc are also supported. $AIRTAP_PORT can also be used as part of the arguments, enabling the use of command-line http servers:

```yaml
# Assuming python is installed
server: "python -m SimpleHTTPServer $AIRTAP_PORT"
# If http-server is available, e.g. npm install -g http-server
server: "http-server -p $AIRTAP_PORT"
```

### firefox_profile (optional)

Selenium (and Sauce Labs) support running Firefox instances with custom user profiles. This allows you to configure anything you can change in `about:config` programmatically for a test run. In `airtap`, you can set these options in `.airtap.yml` with a section under any Firefox browser entry. For instance:

```yaml
browsers:
  - name: firefox
    version: latest
    firefox_profile:
      webgl.force-enabled: true
```

YAML values within the `firefox_profile` section will be transformed into a Firefox profile, zipped, and uploaded to the test worker.
