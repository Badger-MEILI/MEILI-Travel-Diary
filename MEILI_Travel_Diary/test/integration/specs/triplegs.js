function testTriplegs() {
    describe("Triplegs", function() {

        describe("insert transition between triplegs", function() {

            it("valid transition", function (done) {

                var timeDiff = 1 * 60 * 1000; // 5 minutes
                var tripleg = trip.getFirstTripleg();
                var numberOfTriplegsBeforeAdd = trip.triplegs.length;

                trip.insertTransitionBetweenTriplegs(
                    tripleg.getStartTime().getTime() + 2*timeDiff,
                    tripleg.getStartTime().getTime() + (3*timeDiff),
                    tripleg.mode[0].id,
                    tripleg.mode[0].id
                ).done(function (triplegs) {
                        // increment by 2 because of the passive tripleg
                    expect(triplegs.length).to.be.equal(numberOfTriplegsBeforeAdd+2);
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });

            it("insert transition between triplegs should fail due to invalid start time later than end time", function (done) {

                var timeDiff = 60 * 60 * 1000; // 1hour
                var tripleg = trip.getFirstTripleg();

                trip.insertTransitionBetweenTriplegs(
                    tripleg.getStartTime().getTime() + timeDiff,
                    tripleg.getEndTime().getTime() - timeDiff,
                    tripleg.mode[0].id,
                    tripleg.mode[0].id
                ).done(function (result) {
                    done(new Error("Start time of transition should not be allowed to be later than the end time of the transition"));
                }).fail(
                    function (errorMsg, jqXHR, textStatus, errorThrown) {
                        if (jqXHR.responseJSON.error.code != 400) {
                            return done(new Error("Status should be 400"));
                        }
                        expect(jqXHR.responseJSON.error.msg).to.be.equal('Start time cannot be later than end time');
                        done();
                    });
            });


            it("insert transition between triplegs should fail due to invalid parameters", function(done) {

                var timeDiff = 60*60*1000; // 1hour
                var tripleg = trip.getFirstTripleg();

                trip.insertTransitionBetweenTriplegs(
                    tripleg.getStartTime().getTime() + timeDiff,
                    tripleg.getEndTime().getTime() - timeDiff,
                    undefined,
                    null
                ).done(function(result) {
                    done(new Error("Invalid input parameters should not result in a succesfull call"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });
        });

        describe("specify transition poi", function() {

             it("update transition poi should return status true and update tripleg current transition", function(done) {

                var tripleg = trip.getFirstTripleg();
                var newTransitionPoiId = tripleg.places[0].osm_id;
                tripleg.updateTransitionPoiIdOfTripleg(
                    newTransitionPoiId
                ).done(function(result) {
                    expect(result.status).to.be.equal(true);
                    expect(tripleg.getTransition().osm_id).to.be.equal(newTransitionPoiId);
                    done();
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    done(jqXHR);
                });
            });

            it("the specified transition poi id should not be null", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateTransitionPoiIdOfTripleg(
                    null
                ).done(function(result) {
                    done(new Error("the specified transition poi id should not be allowed to be null"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });

            it("the specified transition poi id should not be undefined", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateTransitionPoiIdOfTripleg(
                  undefined
                ).done(function(result) {
                    done(new Error("the specified transition poi id should not be allowed to be undefined"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });

            it("the specified transition poi id should not be empty", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateTransitionPoiIdOfTripleg(
                    ''
                ).done(function(result) {
                    done(new Error("the specified transition poi id should not be allowed to be empty"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });


          it("the specified transition poi id should exist", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateTransitionPoiIdOfTripleg(
                    0
                ).done(function(result) {
                    done(new Error("the specified transition poi id should exists"));
                }).fail(
                    function (errorMsg, jqXHR, textStatus, errorThrown) {
                        if (jqXHR.responseJSON.error.code != 500) {
                            return done(new Error("Status should be 500"));
                        }
                        expect(jqXHR.responseJSON.error.msg).to.not.be.null;
                        done();
                    });
            });
        });


        describe("specify the travel mode of a tripleg", function() {

            it("update travel mode should return status true and update tripleg current mode", function(done) {

                var tripleg = trip.getFirstTripleg();
                var newModeId = tripleg.mode[tripleg.mode.length-1].id;
                tripleg.updateMode(
                    newModeId
                ).done(function(result) {
                    expect(result.status).to.be.equal(true);
                    expect(tripleg.getMode().id).to.be.equal(newModeId);
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });

            it("the specified travel mode should not be null", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateMode(
                    null
                ).done(function(result) {
                    done(new Error("the specified travel mode should not be allowed to be null"));
                }).fail(
                    function (errorMsg, jqXHR, textStatus, errorThrown) {
                        if (jqXHR.responseJSON.error.code != 400) {
                            return done(new Error("Status should be 400"));
                        }
                        expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                        done();
                    });
            });

            it("the specified travel mode should not be undefined", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateMode(
                    undefined
                ).done(function(result) {
                    done(new Error("the specified travel mode should not be allowed to be undefined"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });

            it("the specified travel mode should not be empty", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateMode(
                    ''
                ).done(function(result) {
                    done(new Error("the specified travel mode should not be allowed to be empty"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 400) {
                        return done(new Error("Status should be 400"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.be.equal('Invalid input parameters');
                    done();
                });
            });


            it("the specified travel mode should exist", function(done) {

                var tripleg = trip.getFirstTripleg();

                tripleg.updateMode(
                    0
                ).done(function(result) {
                    done(new Error("the specified travel mode should exists"));
                }).fail(function (errorMsg, jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON.error.code != 500) {
                        return done(new Error("Status should be 500"));
                    }
                    expect(jqXHR.responseJSON.error.msg).to.not.be.null;
                    done();
                });
            });
        });

        describe("tripleg time", function() {
            it("update start time of tripleg should update start time", function(done) {
                var timeDiff = 1 * 60 * 1000; // 1 minute

                var tripleg = trip.getLastTripleg();
                var newStartTime = tripleg.getStartTime().getTime() + timeDiff;

                trip.updateTriplegStartTime(
                    tripleg.getId(),
                    newStartTime
                ).done(function(updatedTrip) {
                    expect(updatedTrip.getLastTripleg().getStartTime().getTime()).to.be.equal(newStartTime);
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });

            it("update end time of tripleg should update end time", function(done) {
                var timeDiff = 1 * 60 * 1000; // 1 minute

                var tripleg = trip.getFirstTripleg();
                var newEndTime = tripleg.getEndTime().getTime() + timeDiff;

                trip.updateTriplegEndTime(
                    tripleg.getId(),
                    newEndTime
                ).done(function(updatedTrip) {
                    expect(updatedTrip.getFirstTripleg().getEndTime().getTime()).to.be.equal(newEndTime);
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });
        });

        describe("tripleg delete", function() {

            it("delete a tripleg should remove the tripleg", function(done) {
                var numberOfTriplegsBeforeDelete = trip.triplegs.length;
                var triplegToDelete = trip.getLastTripleg();
                trip.deleteTripleg(
                    triplegToDelete
                ).done(function(updatedTrip) {
                        // Decrement by 2 because of the passive tripleg
                    expect(updatedTrip.getTriplegById(triplegToDelete.getId())).to.be.null;
                    expect(updatedTrip.triplegs.length).to.be.equal(numberOfTriplegsBeforeDelete-2);
                    done();
                }).fail(function(err) {
                    done(err);
                });
            });
        });
    });
}