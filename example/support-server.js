const http = require('http')

http.createServer(function (req, res) {
  res.end()
}).listen(process.env.AIRTAP_SUPPORT_PORT)
