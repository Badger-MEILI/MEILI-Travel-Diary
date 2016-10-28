
var Login = Login || function(user) {

  this.user = user;

  this.addListeners();

  Emitter(this);

  return this;
}

Login.prototype = {
  addListeners: function() {
    $('body').on('submit', '.form-signin', function(e) {
      var input = $(e.target).serializeArray();

      if(!input[0] && input[0].value === '') {
        throw 'No username provided';
        return;
      }
      if(!input[1] && input[1].value === '') {
        throw 'No password provided';
        return;
      }
      this.user.login(input[0].value, input[1].value)
        .done(function() { page('/map'); })
        .fail(function() { page('/login'); });

      e.preventDefault();
    }.bind(this));
  }
};

