'use strict';

var hljs = require('./hl.js');

// TODO: (thlorenz) pull generic logic into separate module?
function getCode(sources, frame) {
    var codeArr = sources[frame.filename];
    if (!codeArr || codeArr.length < frame.line) return '';

    var code = codeArr[frame.line - 1];

    // IE<=8 has no trim :(
    code = (code.trim && code.trim()) || code;
    if (!code.length) return '';

    // hljs is pretty bad at guessing the language
    var ext = frame.filename.slice(-3);

    var highlight_fn = hljs.highlightAuto;
    if (ext === '.js') {
        highlight_fn = function(src) {
            return hljs.highlight('javascript', src)
        }
    }

    try {
        return highlight_fn(code).value;
    } catch (e) {
        return code;
    }
}

function hashByFile(source_map) {
    var sources = source_map.sources;
    var sources_by_file = {};

    for (var i = 0; i < sources.length; i++) {
      sources_by_file[sources[i]] = source_map.sourcesContent[i] && source_map.sourcesContent[i].split('\n')
    }

    return sources_by_file;
}

function onTraceClick (ev) {
    if (ev.preventDefault) ev.preventDefault();
    if (ev.stopPropagation) ev.stopPropagation();

    var li = (function findDiv (el) {
        var tagname = el.tagName;
        if (!tagname) return null;

        return tagname.toUpperCase() === 'LI' ? el : findDiv(el.parentElement);
    })(ev.target);

    // nothing we can do in that case
    if (!li) return;

    var div = li.children[1];

    // don't show anything if no code was added (should never get here since then it's not clickable)
    if (!div) return false;

    var next = ~div.getAttribute('style').indexOf('display: block') ? 'none' : 'block';
    div.setAttribute('style', 'display: ' + next + ';')
}

var on_click = 'onclick="(' + onTraceClick + ').call(this, arguments[0])"';

// creates clickable anchors for the mapped stack trace
// when clicked the appropriate code in the source map is shown
// the code of the first stack is shown initially by default
module.exports = function (mapped, source_map) {
    var sources_by_file = hashByFile(source_map);

    var str = '<ul class="trace-anchor" style="list-style-type: none;"' + '" ' + on_click + '>'

    for (var i = 0; i < mapped.length; ++i) {
        var frame = mapped[i];
        var code = getCode(sources_by_file, frame);

        // show code for first stacktrace automatically
        var display = i && code.length ? 'none' : 'block';
        var anchor_style = code.length ? '' : 'style="cursor: default; text-decoration: none;"';

        str +=  '<li>';
        str +=      '<a href="" ' + anchor_style + ' >';
        str +=          '<pre>';
        str +=              'at ' + frame.func + ' (' + frame.filename + ':' + frame.line + ':';
        str +=              (frame.column || 0) + ')';
        str +=          '</pre>';
        str +=      '</a>';
        if (code.length) {
            str += '<div class="hljs" style="display: ' + display + ';">' + code + '</div>'
        }
        str +=   '</li>';
    }

    str += '</ul>';
    return str;
};
