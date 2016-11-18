
var Confirm = Confirm || function() {
  return this;
};

Confirm.prototype = {
  show: function(options, callback) {
    var okButtonTxt = options.okButtonTxt || 'Ok';
    var cancelButtonTxt = options.cancelButtonTxt || 'Cancel';
    var type = (' ' + options.type) || '';

    var cancleButton = '<a href="#!" class="btn" data-dismiss="modal">' +
                        cancelButtonTxt +
                      '</a>';
    if(options.type === 'error') {
      cancleButton = '';
    }
     var confirmModal =
      $('<div class="modal fade' + type + '">' +
          '<div class="modal-dialog">' +
          '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<a class="close" data-dismiss="modal" >&times;</a>' +
            '<strong>' + options.heading + '</strong>' +
          '</div>' +

          '<div class="modal-body">' +
            options.question +
          '</div>' +

          '<div class="modal-footer">' +
            cancleButton +
            '<a href="#" id="confirm-ok-button" class="btn btn-primary">' +
              okButtonTxt +
            '</a>' +
          '</div>' +
          '</div>' +
          '</div>' +
        '</div>');

    confirmModal.find('#confirm-ok-button').click(function(e) {
      callback(confirmModal);
      confirmModal.modal('hide');
      e.preventDefault();
    });

    confirmModal.modal('show');
  }
};