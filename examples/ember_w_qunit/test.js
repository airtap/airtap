App.rootElement = '#app-root';
App.setupForTesting();

QUnit.module("Integration Testing", {
  setup: function() {
    App.reset();
    App.injectTestHelpers();
  }
});

test("I should see all of the posts", function() {
  visit("/posts");

  andThen(function() {
    var element = find("h1:contains('Posts')");
    equal(element.length, 1, 'found posts');
  });
});

test("I should see a greeting when I enter my name", function() {
  visit("/");

  click("a.echo");

  fillIn("input.your-name", "Ryan");

  andThen(function() {
    var element = find(".greeting");
    equal(
      element.text().trim(),
      "Hello Ryan"
    );
  });
});
