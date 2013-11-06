App = Ember.Application.create();

App.Router.map(function() {
  this.resource('posts');
  this.route('echo');
});

App.PostsRoute = Ember.Route.extend({
  model: function() {
    return [
      { title: "Hello World" },
      { title: "Test Post" }
    ];
  }
});
