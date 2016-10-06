
var Debug = function(config) {
  return {
    log: function() {
      if(config.debug) {
        console.log( Array.prototype.slice.call(arguments) );
      }
    },
    error: function() {
      console.error( Array.prototype.slice.call(arguments) );
    }
  };
};