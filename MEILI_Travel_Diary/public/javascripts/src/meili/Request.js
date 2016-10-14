
var Request = function(config) {

  var doRequest = function(options) {
    var dfd = $.Deferred();
    log.debug('Sending', options.method, 'request to', options.url)
    log.error(options);
    $.ajax(options)
    .done(function(result) {
      if(result) {
        dfd.resolve(result);
      } else {
        log.error('XHR NO DATA');
        dfd.reject();
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown, a, b, c) {
      var msg = textStatus + ' ' + errorThrown;
      if(jqXHR.responseJSON && jqXHR.responseJSON.error) {
        msg = jqXHR.responseJSON.error.msg;
      }
      throw msg;
      dfd.reject(msg);
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

