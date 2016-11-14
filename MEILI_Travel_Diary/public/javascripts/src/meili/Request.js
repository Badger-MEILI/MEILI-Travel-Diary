
var Request = function(config) {

  var doRequest = function(options, responseValidator) {
    if(!responseValidator) {
      responseValidator = function(dfd, result) { dfd.resolve(result); };
    }

    var dfd = $.Deferred();
    log.debug('Request -> doRequest', 'Sending', options.method, 'request to', options.url)
    $.ajax(options)
    .done(function(result) {
      if(result) {
        responseValidator(dfd, result);
      } else {
        var msg = 'Request got empty result back';
        log.error('Request -> doRequest', msg);
        dfd.reject(msg);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      var msg = textStatus + ' ' + errorThrown;
      if(jqXHR.responseJSON && jqXHR.responseJSON.error) {
        msg = jqXHR.responseJSON.error.msg;
      }
      // do not log passwords
      if(options && options.data && options.data.password) {
        delete options.data.password;
      }
      log.error('Request -> doRequest', msg, JSON.stringify(options));

      // Unauthorizedm, send user to login page
      if(jqXHR.status === 401) {
        page('/login');
      }

      dfd.reject(msg, jqXHR, textStatus, errorThrown);
      throw msg;
    });
    return dfd.promise();
  };

  return {

    get: function(url, data, responseValidator){
      return doRequest({
        method: 'GET',
        url: url,
        data: data
      }, responseValidator);
    },

    post: function(url, data, responseValidator) {
      return doRequest({
        method: 'POST',
        url: url,
        data: data
      }, responseValidator);
    },

    put: function(url, data, responseValidator) {
      return doRequest({
        method: 'PUT',
        url: url,
        data: data
      }, responseValidator);
    },

    delete: function(url, responseValidator) {
      return doRequest({
        method: 'DELETE',
        url: url,
        data: data
      }, responseValidator);
    }

  }
};

