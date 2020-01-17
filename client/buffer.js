if (typeof Uint8Array === 'undefined') {
  // Use `buffer@4` with object fallback implementation
  module.exports = require('buffer@4')
} else {
  // Use faster, more feature-rich `buffer@5`
  module.exports = require('buffer@5')
}
