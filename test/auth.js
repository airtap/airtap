var os = require('os')
var path = require('path')
var fs = require('fs')
var yaml = require('yamljs')

// optinal additional config from $HOME/.airtaprc
var config = path.join(os.homedir(), '.airtaprc')
var airtaprc = {}
if (fs.existsSync(config)) {
  airtaprc = yaml.parse(fs.readFileSync(config, 'utf-8'))
}

module.exports = {
  username: process.env.SAUCE_USERNAME || airtaprc.sauce_username,
  key: process.env.SAUCE_ACCESS_KEY || airtaprc.sauce_key
}
