
var Trip = function(trip, triplegs) {

  if(triplegs && triplegs.length > 0) {
    triplegs[0].isFirst = true;
    triplegs[triplegs.length-1].isLast = true;
  } else {
    triplegs = [];
  }

  var trip = trip;
  var triplegs = triplegs;

  function getTripleg(id, indexDiff) {
    indexDiff = indexDiff ? indexDiff : 0;
    for (var i = 0; i < triplegs.length; i++) {
      if(triplegs[i].triplegid == id) {
        var tripleg = triplegs[i + indexDiff];
        return tripleg ? tripleg : triplegs[i];
      }
    }
    return null;
  }

  return $.extend({

    triplegs: triplegs,

    getTriplegById: function(triplegId) {
      return getTripleg(triplegId);
    },

    getPrevTripleg: function(tripleg) {
      return getTripleg(tripleg.triplegid, -2);
    },

    getNextTripleg: function(tripleg) {
      return getTripleg(tripleg.triplegid, +2);
    },

    getPrevPassiveTripleg: function(tripleg) {
      return getTripleg(tripleg.triplegid, -1);
    },

    getNextPassiveTripleg: function(tripleg) {
      return getTripleg(tripleg.triplegid, +1);
    }

  }, trip);
};