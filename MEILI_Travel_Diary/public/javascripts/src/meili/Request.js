
var Request = function(config) {

  var doRequest = function(options) {
    var dfd = $.Deferred();
    debug.log('Sending', options.method, 'request to', options.url)
    $.ajax(options)
    .done(function(result) {
      if(result) {
        dfd.resolve(result);
      } else {
        debug.error('XHR NO DATA');
        dfd.reject();
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      // !TODO handle error and tell user
      debug.error('XHR FAIL', textStatus);
      dfd.reject(textStatus);
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

