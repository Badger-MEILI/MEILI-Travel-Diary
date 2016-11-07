
var User = User || function() {
  Emitter(this);
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
              var msg = 'Failed to parse user information';
              log.error('User -> verifyLoggedIn', msg);
              dfd.reject(msg);
            }
            // Got id and username
            this.id = userArr[0];
            this.username = userArr[1].split("@")[0].replace(/ /g, '');
            log.info('User -> verifyLoggedIn', 'user logged in', this.id, this.username);
            dfd.resolve(this);
          } else {
              dfd.reject('Not logged in');
          }
        }.bind(this))
      .fail(function(err, jqXHR) {
        var msg = 'Failed to check if user is logged in';
        log.error('User -> verifyLoggedIn', msg, err);
        dfd.reject(msg, jqXHR);
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

  confirmTrip: function(trip) {
    var dfd = $.Deferred();
    api.trips.confirmAnnotationOfTrip(trip.getId())
      .done(function(tripJson) {
          this._setCurrentTrip(tripJson)
            .done(function(trip) { dfd.resolve(trip); })
            .fail(function(err) { dfd.reject(err); });
        }.bind(this))
      .fail(function(err, jqXHR) {
          log.error('User -> confirmTrip', err);
          dfd.reject(err, jqXHR);
        });
    return dfd.promise();
  },

  getPreviousTrip: function(trip) {
    var dfd = $.Deferred();
    api.trips.navigateToPreviousTrip(this.id, trip.getId())
      .done(function(tripJson) {
        // init trip into Trip object and load triplegs
        this._setCurrentTrip(tripJson)
            .done(function(trip) { dfd.resolve(trip); })
            .fail(function(err) { dfd.reject(err); });
      }.bind(this))
      .fail(function(err, jqXHR) {
        log.error('User -> getPreviousTrip', err);
        dfd.reject(err, jqXHR);
      });

    return dfd.promise();
  },

  getNextTrip: function(trip) {
    var dfd = $.Deferred();
    api.trips.navigateToNextTrip(this.id, trip.getId())
      .done(function(tripJson) {
        // init trip into Trip object and load triplegs
        this._setCurrentTrip(tripJson)
            .done(function(trip) { dfd.resolve(trip); })
            .fail(function(err) { dfd.reject(err); });
      }.bind(this))
      .fail(function(err, jqXHR) {
        log.error('User -> getNextTrip', err);
        dfd.reject(err, jqXHR);
      });

    return dfd.promise();
  },

  getLastTrip: function() {
    var dfd = $.Deferred();
    // Get last trip from api
    api.trips.getLast(this.id)
      .done(function(tripJson) {
        // init trip into Trip object and load triplegs
        this._setCurrentTrip(tripJson)
            .done(function(trip) { dfd.resolve(trip); })
            .fail(function(err) { dfd.reject(err); });
      }.bind(this))
      .fail(function(err, jqXHR) {
        log.error('User -> getLastTrip', err);
        dfd.reject(err, jqXHR);
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
      .fail(function(err, jqXHR) {
        log.error('User -> getTriplegsForTrip', err);
        dfd.reject(err, jqXHR);
      });
    return dfd.promise();
  },

  deleteTrip: function(trip) {
    var dfd = $.Deferred();
    // Get last trip from api
    api.trips.delete(trip.getId())
      .done(function(tripJson) {
        // init trip into Trip object and load triplegs
        this._setCurrentTrip(tripJson)
            .done(function(trip) { dfd.resolve(trip); })
            .fail(function(err) { dfd.reject(err); });
      }.bind(this))
      .fail(function(err, jqXHR) {
        log.error('User -> deleteTrip', err);
        dfd.reject(err, jqXHR);
      });

    return dfd.promise();
  },

  insertDestinationPoi: function(name, point) {
    return api.pois.insertDestinationPoi(name, point, this.id).done(function(result) {
        this.currentTrip.addDestinationPlace(result.insert_destination_poi, name, point);
        this.currentTrip.updateDestinationPoiIdOfTrip(result.insert_destination_poi);
      }.bind(this))
      .fail(function(err, jqXHR) {
        log.error('User -> insertDestinationPoi', err);
      });
  },

  _setCurrentTrip: function(tripJson) {
    var dfd = $.Deferred();
    // Set current trip
    if(tripJson.trip_id) {
      this.currentTrip = new Trip(tripJson);
      // Update triplegs for trip
      this.getTriplegsForTrip(this.currentTrip)
        .done(function(trip) {
            this.emit('current-trip-changed', trip);
            dfd.resolve(trip);
          }.bind(this))
        .fail(function(err, jqXHR) {
          log.error('User -> _setCurrentTrip', err);
            dfd.reject(err, jqXHR);
          });
    } else {
      var msg = 'No trip returned from server';
      log.error('User -> _setCurrentTrip', msg);
      dfd.reject(msg);
      throw msg;
    }
    return dfd.promise();
  }
};