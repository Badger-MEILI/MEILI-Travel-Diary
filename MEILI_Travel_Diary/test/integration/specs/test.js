var expect = chai.expect;

var user;
var trip;

var log = Log(CONFIG);
var api = Api({
  api_url: TEST_CONFIG.api_url
});

describe("MEILI test: ", function() {

  before(function(done) {
    // Login user
    $.ajax({
      type: "POST",
      url: TEST_CONFIG.login_url,
      data: { username: TEST_CONFIG.username, password: TEST_CONFIG.password},
      dataType: "json"
    }).done(
      function (result) {
        user = new User(result.userId);
        console.log('User is logged in', user);
        done();
      })
      .fail(
      function (err) {
         done(err);
      });
  });

  testTrips();
  testTriplegs();


  after(function(done) {
    // Reset test data
    $.ajax({
      type: "GET",
      url: TEST_CONFIG.api_url + '/tests/populateWithTestData',
      dataType: "json"
    }).done(
      function (result) {
        console.log('\n ↻ TEST DATA IS RESET');
        done();
      })
      .fail(
      function (err) {
        console.error('Something went wrong when reseting test data.');
        done(err);
      });
  });

});