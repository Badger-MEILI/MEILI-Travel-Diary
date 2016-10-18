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

  testTrips();
  testTriplegs();


});