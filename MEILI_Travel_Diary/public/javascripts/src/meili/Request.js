
var Request = function(config) {

  var doRequest = function(options) {
    var dfd = $.Deferred();
    log.debug('Sending', options.method, 'request to', options.url)
    $.ajax(options)
    .done(function(result) {
      if(result) {
        dfd.resolve(result);
      } else {
        var msg = 'Request got empty result back';
        log.error(msg);
        dfd.reject(msg);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      var msg = textStatus + ' ' + errorThrown;
      if(jqXHR.responseJSON && jqXHR.responseJSON.error) {
        msg = jqXHR.responseJSON.error.msg;
      }
      dfd.reject(jqXHR, textStatus, errorThrown);
      throw msg;
    });
    return dfd.promise();
  };

  return {

    get: function(url, data){
      return doRequest({
        method: 'GET',
        url: url,
        data: data
      });
    },

    post: function(url, data) {
      return doRequest({
        method: 'POST',
        url: url,
        data: data
      });
    },

    put: function(url, data) {
      return doRequest({
        method: 'PUT',
        url: url,
        data: data
      });
    },

    delete: function(url) {
      return doRequest({
        method: 'DELETE',
        url: url,
        data: data
      });
    }

  }
};

