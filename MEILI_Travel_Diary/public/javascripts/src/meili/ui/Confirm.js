
var Confirm = Confirm || function() {
  return this;
};

Confirm.prototype = {
  show: function(heading, question, callback) {
    var okButtonTxt = 'Ok';
    var cancelButtonTxt = 'Cancel';
     var confirmModal =
      $('<div class="modal fade">' +
          '<div class="modal-dialog">' +
          '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<a class="close" data-dismiss="modal" >&times;</a>' +
            '<strong>' + heading + '</strong>' +
          '</div>' +

          '<div class="modal-body">' +
            question +
          '</div>' +

          '<div class="modal-footer">' +
            '<a href="#!" class="btn" data-dismiss="modal">' +
              cancelButtonTxt +
            '</a>' +
            '<a href="#" id="confirm-ok-button" class="btn btn-primary">' +
              okButtonTxt +
            '</a>' +
          '</div>' +
          '</div>' +
          '</div>' +
        '</div>');

    confirmModal.find('#confirm-ok-button').click(function(e) {
      callback();
      confirmModal.modal('hide');
      e.preventDefault();
    });

    confirmModal.modal('show');
  }
};