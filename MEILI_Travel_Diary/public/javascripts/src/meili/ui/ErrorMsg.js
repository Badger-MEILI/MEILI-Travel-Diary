
var ErrorMsg = ErrorMsg || function(elementId) {
  this.elementId = elementId || 'body';
  return this;
};

ErrorMsg.prototype = {
  errMsgElmtId: 'error-message',
  timerHide: null,

  show: function(msg) {
    this.hide();
    $(this.elementId).prepend('<div id="' + this.errMsgElmtId + '" class="alert alert-danger alert-dismissible" role="alert">' +
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
      '<strong class="type">Error</strong> <span class="msg">' + msg + '</span>' +
    '</div>');
    if(this.timerHide) {
      clearTimeout(this.timerHide);
    }
    this.timerHide = setTimeout(function() {
      this.hide();
    }.bind(this), 10000);
  },

  hide: function() {
    $('#'+this.errMsgElmtId).remove();
  }
};