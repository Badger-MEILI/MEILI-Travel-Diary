
var Trip = Trip || function(trip, triplegs) {
  Emitter($.extend(this, trip));
  this.mapLayer = L.featureGroup();
  if(triplegs) {
    this.updateTriplegs(triplegs);
  }

  return this;
};

Trip.prototype = {

  getId: function() {
    return this.trip_id;
  },

  updateTriplegs: function(newTriplegs) {
    this.removeTriplegs();
    if(newTriplegs && newTriplegs.length > 0) {
      newTriplegs[0].isFirst = true;
      newTriplegs[newTriplegs.length-1].isLast = true;
    }
    for (var i = 0; i < newTriplegs.length; i++) {
      newTriplegs[i] = new Tripleg(newTriplegs[i]);
    };
    this.triplegs = newTriplegs;
    this.emit('triplegs-update', this);
    return this.triplegs;
  },

  removeTriplegs: function() {
    this._reset
    this.emit('triplegs-remove', this);
    this.triplegs = [];
    return this;
  },

  getTriplegById: function(triplegId) {
    return this._getTripleg(triplegId);
  },

  getPrevTripleg: function(tripleg) {
    return this._getTripleg(tripleg.triplegid, -2);
  },

  getNextTripleg: function(tripleg) {
    return this._getTripleg(tripleg.triplegid, +2);
  },

  getPrevPassiveTripleg: function(tripleg) {
    return this._getTripleg(tripleg.triplegid, -1);
  },

  getNextPassiveTripleg: function(tripleg) {
    return this._getTripleg(tripleg.triplegid, +1);
  },

  _getTripleg: function(id, indexDiff) {
    indexDiff = indexDiff ? indexDiff : 0;
    for (var i = 0; i < this.triplegs.length; i++) {
      if(this.triplegs[i].triplegid == id) {
        var tripleg = this.triplegs[i + indexDiff];
        // If tripleg with diff is undefined try returning current
        tripleg = tripleg ? tripleg : this.triplegs[i];
        return tripleg;
      }
    }
    return null;
  },

  _updateTime: function(timeToUpdate, triplegId, newTime) {
    var dfd = $.Deferred();
    var tripleg = this.getTriplegById(triplegId);
    if(tripleg) {
      var apiEndPoint = api.triplegs;
      var id = tripleg.getId();
      // If this is is the first tripleg do operations on trip
      if(tripleg.isFirst) {
        apiEndPoint = api.trips;
        id = this.getId();
      }

      apiEndPoint[timeToUpdate](id, newTime)
        .done(function(result) {
          this.updateTriplegs(result.triplegs);
          dfd.resolve(this.triplegs);
        }.bind(this))
        .fail(function(err) {
          dfd.reject(err);
        });

    } else {
      var msg = 'Tripleg ' + triplegId + ' not found on trip' + this.getId();
      log.error(msg);
      dfd.reject(msg);
    }
    return dfd.promise();
  },

  updateStartTime: function(triplegId, newTime) {
    return this._updateTime('updateStartTime', triplegId, newTime);
  },

  updateEndTime: function(triplegId, newTime) {
    return this._updateTime('updateEndTime', triplegId, newTime);
  }
};
