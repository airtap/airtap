// returns available browsers to test on
// results are keyed by browser
// each browser has an array of objects with version and platform info
// some versions may have more than one OS they can run on
// {
//     'chrome': [
//        { version: 27, platform: 'Windows XP' }
//        { version: 27, platform: 'Mac 10.6' }
//     ]
// }

var https = require('https');

module.exports = function(cb) {
    var info_opt = {
        host: 'saucelabs.com',
        path: '/rest/v1.1/info/scout?os_product_names=true'
    };

    https.get(info_opt, function(res) {
        res.setEncoding('utf8');
        var body = '';

        res.on('data', function(data) {
            body += data;
        });

        res.once('end', function() {
            try {
                cb(null, format(JSON.parse(body)));
            } catch (err) {
                return cb(err);
            }
        });
    });
};

function format(obj) {
    var browsers = {};
    obj.forEach(function(info) {
        var name = info.name;

        var browser = browsers[name] = browsers[name] || [];
        browser.push({
            name: name,
            version: info.short_version,
            platform: info.os,
            platform_display: info.os_display
        });
    });

    // common mappings for some of us senile folks
    browsers.ie = browsers.iexplore;
    browsers.chrome = browsers.googlechrome;

    return browsers;
}
