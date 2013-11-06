function html(el, html) {
    if (!html) {
        return el.innerHTML = '';
    }
    el.innerHTML = html;
}

module.exports = html;
