'use strict'

var hljs = require('highlight.js')

function getCode (sources, frame) {
  var codeArr = sources[frame.filename]
  if (!codeArr || codeArr.length < frame.line) return ''

  var code = codeArr[frame.line - 1]

  // IE<=8 has no trim :(
  code = (code.trim && code.trim()) || code
  if (!code.length) return ''

  // hljs is pretty bad at guessing the language
  var ext = frame.filename.slice(-3)

  var highlightFn = hljs.highlightAuto
  if (ext === '.js') {
    highlightFn = function (src) {
      return hljs.highlight('javascript', src)
    }
  }

  try {
    return highlightFn(code).value
  } catch (e) {
    return code
  }
}

function hashByFile (sourceMap) {
  var sources = sourceMap.sources
  var sourcesByFile = {}

  for (var i = 0; i < sources.length; i++) {
    sourcesByFile[sources[i]] = sourceMap.sourcesContent[i] && sourceMap.sourcesContent[i].split('\n')
  }

  return sourcesByFile
}

function onTraceClick (ev) {
  if (ev.preventDefault) ev.preventDefault()
  if (ev.stopPropagation) ev.stopPropagation()

  var tgt = ev.target
  if (tgt.className !== 'trace') return

  var input = tgt.parentElement.getElementsByClassName('trace-copy')[0]
  if (!input) return

  input.style.display = 'inline'
  input.style.width = tgt.offsetWidth + 'px'
  input.focus()
  input.select()

  input.onblur = function () {
    input.style.display = 'none'
    tgt.style.display = 'inline'
  }

  tgt.style.display = 'none'
}

var onClick = 'onclick="(' + onTraceClick + ').call(this, arguments[0])"'

module.exports = function (mapped, sourceMap) {
  var sourcesByFile = hashByFile(sourceMap)

  var str = '<ul class="stack-trace" style="list-style-type: none;"' + '" ' + onClick + '>'

  for (var i = 0; i < mapped.length; ++i) {
    var frame = mapped[i]
    var code = getCode(sourcesByFile, frame)

    // show code for first stacktrace automatically
    var display = i && code.length ? 'none' : 'block'

    str += '<li>'
    str += '<span>'
    str += 'at ' + frame.func + ' ('
    str += '<input class="trace-copy" spellcheck="false" type="text" value="' + frame.filename + ':' + frame.line + '">'
    str += '<span class="trace">' + frame.filename + ':' + frame.line + '</span>'
    str += ':' + (frame.column || 0) + ')'
    str += '</span>'
    if (code.length) {
      str += '<div class="hljs" style="display: ' + display + ';">' + code + '</div>'
    }
    str += '</li>'
  }

  str += '</ul>'
  return str
}
