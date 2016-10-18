
function testTriplegs() {

  describe("Triplegs", function() {
    it("insert transition between triplegs should return a list of updated triplegs", function(done) {
        // TODO -> this operation should fail due to invalid state (start time later than end time)
      var oldTriplegs = trip.triplegs;
      var timeDiff = 60*60*1000; // 1hour
      var tripleg = trip.triplegs[0];
      trip.insertTransitionBetweenTriplegs(
        (tripleg.getStartTime().getTime() + timeDiff),
        (tripleg.getEndTime().getTime() - timeDiff),
        tripleg.mode[0].id,
        tripleg.mode[0].id
      ).done(
        function (trip) {
          expect(trip.triplegs).to.not.eql(oldTriplegs);
          done();
        })
        .fail(
        function (err,f,d) {
          console.log(err,f,d);
           done(f);
        });
    });
  });

}