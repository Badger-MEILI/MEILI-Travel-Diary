
function testTrips() {

  describe("Trips", function() {
    it("get last trip for user should return a trip with triplegs", function(done) {
      user.getLastTrip()
        .done(function(resTrip) {
          trip = resTrip;
          expect(trip).to.have.property("trip_id");
          expect(trip.triplegs).to.have.length.above(0);
          done();
        })
        .fail(function (err,f,d) {
          console.log(err,f,d);
          done(f);
        });
    });
  });

}