// convert zuul mocha ui's to our ui
var ui_map = {
  'mocha-bdd': 'bdd',
  'mocha-qunit': 'qunit',
  'mocha-tdd': 'tdd'
};

// TODO(shtylman) setup mocha?
mocha.setup({
  ui: ui_map[zuul.ui]
});
