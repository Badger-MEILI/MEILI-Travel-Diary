
var Trip = Trip || function(trip, triplegs) {
  Emitter($.extend(this, trip));
  this.mapLayer = L.featureGroup();
  if(triplegs) {
    this.updateTriplegs(triplegs);
  }

  return this;
};

Trip.prototype = {

  // Getters
  // -------------------------------------------
  // -------------------------------------------

  getId: function() {
    return this.trip_id;
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

  // Local changes on trip
  // -------------------------------------------
  // -------------------------------------------

  updateTriplegs: function(newTriplegs) {
    this.removeTriplegs();
    if(newTriplegs && newTriplegs.length > 0) {
      newTriplegs[0].isFirst = true;
      newTriplegs[newTriplegs.length-1].isLast = true;
    }
    for (var i = 0; i < newTriplegs.length; i++) {
      newTriplegs[i] = new Tripleg(newTriplegs[i]);
      newTriplegs[i].on('tripleg-updated', function() { this.emit('triplegs-update', this); }.bind(this));

      // Add reference to next and previous tripleg
      if(i-2 >= 0) {
        newTriplegs[i-1].setPrevNext(newTriplegs[i-2], newTriplegs[i]);
      }
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

  // API connected
  // -------------------------------------------
  // -------------------------------------------

  updateStartTime: function(triplegId, newTime) {
    return this._updateTime('start', triplegId, newTime);
  },

  updateEndTime: function(triplegId, newTime) {
    return this._updateTime('end', triplegId, newTime);
  },

  insertTransitionBetweenTriplegs: function(startTime, endTime, fromMode, toMode) {
    var dfd = $.Deferred();
    api.triplegs.insertTransitionBetweenTriplegs(this.getId(), startTime, endTime, fromMode, toMode)
      .done(function(result) {
        if(result.triplegs) {
          this.updateTriplegs(result.triplegs);
          dfd.resolve(this.triplegs);
        } else {
          var msg = 'No triplegs returned';
          throw msg
          dfd.reject(msg);
        }
      }.bind(this))
      .fail(function(err) {
        dfd.reject(err);
      });
    return dfd.promise();
  },

  // Internal methods
  // -------------------------------------------
  // -------------------------------------------

  _updateTime: function(timeToUpdate, triplegId, newTime) {
    var dfd = $.Deferred();
    var tripleg = this.getTriplegById(triplegId);
    if(tripleg) {
      var apiMethod = timeToUpdate === 'start' ? 'updateStartTime' : 'updateEndTime';
      var apiEndPoint = api.triplegs;
      var id = tripleg.getId();
      // If this is is the first tripleg do operations on trip
      if((tripleg.isFirst && timeToUpdate === 'start') || (tripleg.isLast && timeToUpdate === 'end')) {
        apiEndPoint = api.trips;
        id = this.getId();
      }

      apiEndPoint[apiMethod](id, newTime)
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
  }

};
