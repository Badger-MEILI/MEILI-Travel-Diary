
var Log = function(config) {
  return {
    debug: function() {
      if(config.debug) {
        console.debug( Array.prototype.slice.call(arguments) );
      }
    },
    error: function() {
      console.error( Array.prototype.slice.call(arguments) );
    }
  };
};