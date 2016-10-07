
var Tripleg = function(tripleg) {
  var tripleg = tripleg;

  function getFirstPoint() {
    return tripleg.points[0];
  }

  function getLastPoint() {
    return tripleg.points[tripleg.points.length-1];
  }

  function formatDate(triplegDate) {
    return (triplegDate.getHours() < 10 ? '0' : '') + triplegDate.getHours() +
            ':' +
            (triplegDate.getMinutes() < 10 ? '0' : '') + triplegDate.getMinutes()
  }
  return $.extend({
    getStartTime: function(formatted) {
      var startTime = new Date(getFirstPoint().time);
      return formatted ? formatDate(startTime) : startTime;
    },

    getEndTime: function(formatted) {
      var endTime = new Date(getLastPoint().time);
      return formatted ? formatDate(endTime) : endTime;
    }
  }, tripleg)
};