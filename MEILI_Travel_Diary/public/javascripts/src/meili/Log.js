
var Log = Log || function(config) {
  this.config = config;

  if(typeof ga === 'undefined') {
    this.error('Cant find ga. Google Analtyics include is missing?');
  } else {
    if(location.host !== 'localhost:3000') {
      if(config.google_analytics_tracking_id) {
        // Initiating Google Analytics tracking and sending page view
        this.sendToGoogleAnalytics = true;
        ga('create', config.google_analytics_tracking_id, 'auto');
        this._gaSendPageView();
      } else {
        this.error('No Google Analytics id where configured');
      }
    }
  }

  return this;
};

Log.prototype = {

  sendToGoogleAnalytics: false,

  _keepQuiet: function() {
    return this.config.log_level === 'silent';
  },

  _gaSendPageView: function(page) {
    if(this.sendToGoogleAnalytics) {
      ga('send', 'pageview', page);
    }
  },
  _gaSendEvent: function(category, action, label, value) {
    if(this.sendToGoogleAnalytics) {
      ga('send', 'event', category, action, label, value);
    }
  },

  debug: function() {
    if(this.config.debug && !this._keepQuiet() && console && console.debug) {
      console.debug( Array.prototype.slice.call(arguments).join(' ') );
    }
  },
  info: function() {
    if(!this._keepQuiet() && console && console.info) {
      console.info( Array.prototype.slice.call(arguments).join(' ') );
    }
  },
  error: function() {
    if(!this._keepQuiet()) {
      var args = Array.prototype.slice.call(arguments);
      if(args.length > 0) {
        var action = args[0];
        args.shift(); // remove first
        var errorMsg = args.join(' ');
        this._gaSendEvent('ERROR', action, errorMsg);
        if(console && console.error) {
          console.error('ERROR', action,  errorMsg);
        }
      }
    }
  }
};