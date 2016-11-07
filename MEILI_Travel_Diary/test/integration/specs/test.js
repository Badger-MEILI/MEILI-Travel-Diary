var expect = chai.expect;

var user;
var trip;

var log = new Log(CONFIG);
var api = Api({
  api_host: TEST_CONFIG.api_host,
  api_url: TEST_CONFIG.api_url
});

describe("MEILI test: ", function() {

  before(function(done) {

    user = new User();

    user.login(TEST_CONFIG.username, TEST_CONFIG.password)
      .done(function() {
        user.verifyLoggedIn()
          .done(function() {
            console.log('User is logged in', user);
            done();
          })
          .fail(function (err) {
            done(err);
            });
        })
      .fail(function (err, a, b) {
        console.log('LOGIN FAILED', err, a, b);
        done(err);
      });
  });

  testTrips();
  testTriplegs();
  testPois();

  after(function(done) {
    // Reset test data
    $.ajax({
      type: "GET",
      url: [TEST_CONFIG.api_host, TEST_CONFIG.api_url, 'tests/populateWithTestData'].join('/'),
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