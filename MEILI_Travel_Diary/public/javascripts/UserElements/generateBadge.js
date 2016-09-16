/**
 * Created by adi on 2016-09-09.
 */

    function generateBadge(user_id){

    var badge_holder = document.getElementById('badge_holder');

    var request = $.ajax({
        url: "/apiv2/trips/getTripsForBadge",
        type: "POST",
        data: {user_id:user_id},
        cache: false
    });

    request.done(function(msg) {
        console.log(msg);

        var parsedNumberOfTrips = msg.rows[0].user_get_badge_trips_info;
        var numberOfTripsBadge = document.getElementById('tripsLeft');
        numberOfTripsBadge.innerHTML = parsedNumberOfTrips;
        badge_holder.style.visibility = "visible";
    });

}