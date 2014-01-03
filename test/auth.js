var osenv = require('osenv');
var path = require('path');
var fs = require('fs');
var yaml = require('yamljs');

// optinal additional config from $HOME/.zuulrc
var home_config = path.join(osenv.home(), '.zuulrc');
var zuulrc = {};
if (fs.existsSync(home_config)) {
    zuulrc = yaml.parse(fs.readFileSync(home_config, 'utf-8'));
}

module.exports = {
    username: process.env.SAUCE_USERNAME || zuulrc.sauce_username,
    key: process.env.SAUCE_ACCESS_KEY || zuulrc.sauce_key
};
