
var ErrorMsg = ErrorMsg || function(elementId) {
  this.elementId = elementId || 'body';
  return this;
};

ErrorMsg.prototype = {
  show: function(msg) {
    $(this.elementId).prepend('<div id="error-message"class="alert alert-danger alert-dismissible" role="alert">' +
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
      '<strong class="type">Fel</strong> <span class="msg">' + msg + '</span>' +
    '</div>');
  }
};