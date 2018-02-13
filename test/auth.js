var osenv = require('osenv');
var path = require('path');
var fs = require('fs');
var yaml = require('yamljs');

// optinal additional config from $HOME/.airtaprc
var home_config = path.join(osenv.home(), '.airtaprc');
var airtaprc = {};
if (fs.existsSync(home_config)) {
    airtaprc = yaml.parse(fs.readFileSync(home_config, 'utf-8'));
}

module.exports = {
    username: process.env.SAUCE_USERNAME || airtaprc.sauce_username,
    key: process.env.SAUCE_ACCESS_KEY || airtaprc.sauce_key
};
