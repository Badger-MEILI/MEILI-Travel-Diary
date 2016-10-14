var expect = chai.expect;

var USER_ID;
var TRIP_ID;
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
        USER_ID = result.userId;
        done();
      })
      .fail(
      function (err) {
         done(err);
      });
  });

  describe("Trips", function() {
    it("get last trip for user should return a trip", function(done) {
      api.trips.getLast(USER_ID).done(
        function (result) {
          TRIP_ID = result.trip_id;
          expect(result).to.have.property("trip_id");
          done();
        })
        .fail(
        function (err,f,d) {
          console.log(err,f,d);
           done(f);
        });
    });

  });


  describe("Triplegs", function() {
    it("get triplegs for non existing trip should return empty array of triplegs", function(done) {
      api.triplegs.get(3454).done(
        function (result) {
          expect(result.length).to.be.equal(0);
          done();
        })
        .fail(
        function (err,f,d) {
          console.log(err,f,d);
           done(f);
        });
    });

    it("get triplegs for a trip should return triplegs", function(done) {
      api.triplegs.get(TRIP_ID).done(
        function (result) {
          expect(result).to.have.property("triplegs");
          done();
        })
        .fail(
        function (err,f,d) {
          console.log(err,f,d);
           done(f);
        });
    });

    it("get triplegs for a trip should return triplegs", function(done) {
      api.triplegs.get(TRIP_ID).done(
        function (result) {
          expect(result).to.have.property("triplegs");
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