function testTriplegs() {

  describe("Triplegs error calls", function() {
      it("insert transition between triplegs should fail due to invalid start time later than end time", function(done) {

          var timeDiff = 60*60*1000; // 1hour
          var tripleg = trip.triplegs[0];

          trip.insertTransitionBetweenTriplegs(
              tripleg.getStartTime().getTime() + timeDiff,
              tripleg.getEndTime().getTime() - timeDiff,
              tripleg.mode[0].id,
              tripleg.mode[0].id
          ).done(function(result) {
                  done(new Error("Start time of transition should not be allowed to be later than the end time of the transition"));
              }).fail(
              function (jqXHR, textStatus, errorThrown) {
                  if (jqXHR.responseJSON.error.code != 400) return done(new Error("Status should be 400"));
                  expect(jqXHR.responseJSON.error.msg).to.be.equal('Start time cannot be later than end time');
                  done();
              });
      });

      it("insert transition between triplegs should fail due to wrong parameter state", function(done) {

          var timeDiff = 60*60*1000; // 1hour
          var tripleg = trip.triplegs[0];

          trip.insertTransitionBetweenTriplegs(
              tripleg.getStartTime().getTime() + timeDiff,
              tripleg.getEndTime().getTime() - timeDiff,
              undefined,
              null
          ).done(function(result) {
                  done(new Error("Invalid input parameters should not result in a succesfull call"));
              }).fail(
              function (jqXHR, textStatus, errorThrown) {
                  if (jqXHR.responseJSON.error.code != 400) return done(new Error("Status should be 400"));
                  expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                  done();
              });
      });

      it("the specified transition poi id should not be null", function(done) {

          var tripleg = trip.triplegs[0];

          tripleg.updateTransitionPoiIdOfTripleg(
              null
          ).done(function(result) {
                  done(new Error("the specified transition poi id should not be allowed to be null"));
              }).fail(
              function (jqXHR, textStatus, errorThrown) {
                  if (jqXHR.responseJSON.error.code != 400) return done(new Error("Status should be 400"));
                  expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                  done();
              });
      });

      it("the specified transition poi id should not be undefined", function(done) {

          var tripleg = trip.triplegs[0];

          tripleg.updateTransitionPoiIdOfTripleg(
              undefined
          ).done(function(result) {
                  done(new Error("the specified transition poi id should not be allowed to be undefined"));
              }).fail(
              function (jqXHR, textStatus, errorThrown) {
                  if (jqXHR.responseJSON.error.code != 400) return done(new Error("Status should be 400"));
                  expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                  done();
              });
      });

      it("the specified transition poi id should not be empty", function(done) {

          var tripleg = trip.triplegs[0];

          tripleg.updateTransitionPoiIdOfTripleg(
              ''
          ).done(function(result) {
                  done(new Error("the specified transition poi id should not be allowed to be empty"));
              }).fail(
              function (jqXHR, textStatus, errorThrown) {
                  if (jqXHR.responseJSON.error.code != 400) return done(new Error("Status should be 400"));
                  expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                  done();
              });
      });
  });
}