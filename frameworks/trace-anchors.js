'use strict';
/*jshint browser: true*/

// Not ideal: (thlorenz) ZeroClipboard has to load via a script tag, otherwise things don't work, I suspect that this is a permissions problem
/* global ZeroClipboard */

var hljs = require('./hl.js');

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

    var details = li.children[1];

    // don't show anything if no code was added (should never get here since then it's not clickable)
    if (!details) return false;

    var next = ~details.getAttribute('style').indexOf('display: block') ? 'none' : 'block';
    details.setAttribute('style', 'display: ' + next + ';')
}

var on_click = 'onclick="(' + onTraceClick + ').call(this, arguments[0])"';

// creates clickable anchors for the mapped stack trace
// when clicked the appropriate code in the source map is shown
// the code of the first stack is shown initially by default
exports = module.exports = function (mapped, source_map) {
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
        str +=      '<div class="details" style="display: block;">'
        if (i === 0) {
        str +=        '<button class="zc-button" id="zc-button-' + i + '" data-clipboard-target="zc-textarea-' + i + '" style="float:right">Copy</button>'
        str +=        '<textarea id="zc-textarea-' + i + '" cols="80" rows="1">' + frame.filename + ':' + frame.line + '</textarea>'
        }
        if (code.length) {
            str +=    '<div class="hljs" style="display: ' + display + ';min-width: 500px;">' + code + '</div>'
        }
        str +=     '</div>'
        str +=   '</li>';
    }

    str += '</ul>';
    return str;
};

exports.init_clipboard = function () {
    // for now we only support the first stacktrace to be clipped
    return new ZeroClipboard(document.getElementById("zc-button-0"));
};

ZeroClipboard.config({
    trustedDomains: [window.location.protocol + "//" + window.location.host ],
    moviePath: "/__zuul/ZeroClipboard.swf"
});
