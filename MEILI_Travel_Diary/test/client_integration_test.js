var expect = chai.expect;

var user;
var trip;

var log = Log(CONFIG);
var api = Api({
  api_url: TEST_CONFIG.api_url
});

describe("API", function() {

  before(function(done) {
    $.ajax({
      type: "POST",
      url: TEST_CONFIG.login_url,
      data: { username: TEST_CONFIG.username, password: TEST_CONFIG.password},
      dataType: "json"
    }).done(
      function (result) {
        user = new User(result.userId);
        done();
      })
      .fail(
      function (err) {
         done(err);
      });
  });

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


  describe("Triplegs", function() {
    it("insert transition between triplegs should return a list of updated triplegs", function(done) {
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
});