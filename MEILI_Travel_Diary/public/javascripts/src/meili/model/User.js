
var User = User || function(userId) {
  this.userId = userId;
};

User.prototype = {
  userId: null,
  currentTrip: null,

  getNumberOfTrips: function() {
    return api.trips.getNumberOfTrips(this.userId);
  },

  getLastTrip: function() {
    var dfd = $.Deferred();
    api.trips.getLast(this.userId)
      .done(function(trip) {
        this.currentTrip = new Trip(trip);
        api.triplegs.get(this.currentTrip.getId())
          .done(function(result) {
            this.currentTrip.updateTriplegs(result.triplegs);
            dfd.resolve(this.currentTrip);
          }.bind(this))
          .fail(function(err) {
            dfd.reject(err);
          });
      }.bind(this))
      .fail(function(err) {
            dfd.reject(err);
          });

    return dfd.promise();
  }
};