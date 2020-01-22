const { Transform } = require('readable-stream')

module.exports = function (b, opts) {
  b.transform(function (file) {
    return new Transform({
      transform (buf, enc, next) {
        this.push(buf.toString('utf8').replace(/bar/g, 'baz'))
        next()
      }
    })
  })
}
