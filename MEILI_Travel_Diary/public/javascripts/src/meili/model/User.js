
var User = User || function() {

  return this;
};

User.prototype = {
  id: null,
  username: null,
  currentTrip: null,

  // API connected
  // -------------------------------------------
  // -------------------------------------------

  verifyLoggedIn: function() {
    var dfd = $.Deferred();
    api.users.loggedIn()
      .done(function(userStr) {
          // trying to parse user string returned from server
          if (userStr !== undefined && userStr !== "undefined") {
            var userArr = userStr.split(",");
            if(userArr[0] == undefined || userArr[1] == undefined) {
              dfd.reject('Failed to parse user information');
            }
            // Got id and username
            this.id = userArr[0];
            this.username = userArr[1].split("@")[0].replace(/ /g, '');
            dfd.resolve(this);
          } else {
              dfd.reject('Not logged in');
          }
        }.bind(this))
      .fail(function() {
        dfd.reject('Failed to check if user is logged in');
      });
    return dfd.promise();
  },

  login: function(username, password) {
    this.username = username;
    return api.users.login(username, password);
  },

  getNumberOfTrips: function() {
    return api.trips.getNumberOfTrips(this.id);
  },

  getPreviousTrip: function(tripId) {
    var dfd = $.Deferred();
    api.trips.navigateToPreviousTrip(this.id)
      .done(function(trip) {
        // init trip into Trip object and load triplegs
        this._initTrip(tripJson)
          .done(function(trip) {
            // Set current trip and resolve
            this.currentTrip = trip;
            dfd.resolve(trip);
          }.bind(this));
      }.bind(this))
      .fail(function(err) {
        dfd.reject(err);
      });

    return dfd.promise();
  },

  getNextTrip: function(tripId) {
    var dfd = $.Deferred();
    api.trips.navigateToNextTrip(this.id)
      .done(function(trip) {
        // init trip into Trip object and load triplegs
        this._initTrip(tripJson)
          .done(function(trip) {
            // Set current trip and resolve
            this.currentTrip = trip;
            dfd.resolve(trip);
          }.bind(this));
      }.bind(this))
      .fail(function(err) {
        dfd.reject(err);
      });

    return dfd.promise();
  },

  getLastTrip: function() {
    var dfd = $.Deferred();
    // Get last trip from api
    api.trips.getLast(this.id)
      .done(function(tripJson) {
        // init trip into Trip object and load triplegs
        this._initTrip(tripJson)
          .done(function(trip) {
            // Set current trip and resolve
            this.currentTrip = trip;
            dfd.resolve(trip);
          }.bind(this));
      }.bind(this))
      .fail(function(err) {
        dfd.reject(err);
      });

    return dfd.promise();
  },

  getTriplegsForTrip: function(trip) {
    var dfd = $.Deferred();
    api.triplegs.get(trip.getId())
      .done(function(result) {
        trip.updateTriplegs(result.triplegs);
        dfd.resolve(trip);
      })
      .fail(function(err) {
        dfd.reject(err);
      });
    return dfd.promise();
  },

  _initTrip: function(tripJson) {
    var trip = new Trip(tripJson);
    return this.getTriplegsForTrip(trip);
  }
};