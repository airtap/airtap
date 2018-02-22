// launch integration and unit tests
// require('bulk-require')(__dirname, ['integration/*.js', 'unit/*.js'])
require('./integration/tape-sauce.js')
require('./integration/tape-phantom.js')
