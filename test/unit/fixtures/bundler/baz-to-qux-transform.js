const { Transform } = require('readable-stream')

module.exports = function (file) {
  return new Transform({
    transform (buf, enc, next) {
      this.push(buf.toString('utf8').replace(/baz/g, 'qux'))
      next()
    }
  })
}
