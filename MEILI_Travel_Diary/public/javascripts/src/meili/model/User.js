
var User = User || function(userId) {
  this.userId = userId;
};

User.prototype = {
  userId: null,
  currentTrip: null,

  // API connected
  // -------------------------------------------
  // -------------------------------------------

  getNumberOfTrips: function() {
    return api.trips.getNumberOfTrips(this.userId);
  },

  getPreviousTrip: function(tripId) {
    var dfd = $.Deferred();
    api.trips.navigateToPreviousTrip(this.userId)
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
    api.trips.navigateToNextTrip(this.userId)
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
    api.trips.getLast(this.userId)
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