/**
 * Created by adi on 2016-09-09.
 */

function getNextTripToProcess(user_id){
    var request = $.ajax({
        url: "/apiv2/trips/getLastTripOfUser",
        type: "GET",
        data: {user_id:user_id},
        cache: false
    });

    return request;
}