
var Log = function(config) {
  function keepQuiet() {
    return config.log_level === 'silent';
  }
  return {
    debug: function() {
      if(config.debug && !keepQuiet()) {
        console.debug( Array.prototype.slice.call(arguments) );
      }
    },
    info: function() {
      if(!keepQuiet()) {
        console.info( Array.prototype.slice.call(arguments) );
      }
    },
    error: function() {
      if(!keepQuiet()) {
        console.error( Array.prototype.slice.call(arguments) );
      }
    }
  };
};