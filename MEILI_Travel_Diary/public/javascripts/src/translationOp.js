/*
 MEILI Travel Diary - web interface that allows to annotate GPS trajectories
 fused with accelerometer readings into travel diaries

 Copyright (C) 2014-2016 Adrian C. Prelipcean - http://adrianprelipcean.github.io/
 Copyright (C) 2016 Badger AB - https://github.com/Badger-MEILI

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function select_language(language) {
    /*console.log('called lang select '+language);
    if (language!=undefined)
    $("[lang]").each(function () {
        if ($(this).attr("lang") == language)
            $(this).show();
        else
            $(this).hide();
    });*/
}

function generateOnDemandGuide(currentTrip){

    var noCheck = true;
    console.log(currentTrip);

    var onDemandGuide = introJs();
    var stepArray= [];

    currentTrip.purposes.sort(comparePurpose);
    currentTrip.destination_places.sort(comparePlace);

    // TODO if tripleg mode is specified

    for (var i in currentTrip.triplegs){
        if (currentTrip.triplegs[i].type_of_tripleg==1){
            currentTrip.triplegs[i].mode.sort(compare);
            // console.log(currentTrip.triplegs[i].mode[0]);
            if (currentTrip.triplegs[i].mode[0].certainty<=50) {
                noCheck=false;
                console.log('failed tripleg '+currentTrip.triplegs[i].triplegid+' test '+currentTrip.triplegs[i].mode[0].certainty);
                if (getLanguage()=="en")
                stepArray.push(createAidStep('It looks like you forgot to specify the travel mode of this tripleg.',"#selectbasic"+currentTrip.triplegs[i].triplegid));
                else
                    stepArray.push(createAidStep('Du har glömt att ange färdsätt för den här förflyttningen.',"#selectbasic"+currentTrip.triplegs[i].triplegid));
            }
        }
    }

    // TODO if destination is specified
    if (currentTrip.destination_places[0].accuracy<=50) {
        noCheck=false;
        console.log('failed destination places test '+ (currentTrip.destination_places[0].accuracy+'<='+50));
        if (getLanguage()=="en")
        stepArray.push(createAidStep('Please specify your trip\'s destination.','#placeSelect'));
        else
            stepArray.push(createAidStep('Ange din målpunkt för förflyttningen.','#placeSelect'));
    }

    // TODO if purpose is specified
    if (currentTrip.purposes[0].accuracy<=50) {
        noCheck=false;
        console.log('failed purpose test '+currentTrip.purposes[0].accuracy);
        console.log(document.getElementById('purposeSelect'));
        if (getLanguage()=="en")
        stepArray.push(createAidStep('Please specify your trip\'s purpose.','#purposeSelect'));
        else
            stepArray.push(createAidStep('Ange ärendet för förflyttningen.','#purposeSelect'));
    }

    if (noCheck) {
            if (getLanguage()=="en")
        stepArray.push(createAidStep('You\'re good to go to the next trip','#processNext'));
        else
            stepArray.push(createAidStep('Du kan fortsätta med nästa förflyttning.','#processNext'));
    }

    onDemandGuide.setOptions({steps:stepArray, showProgress:false,showBullets:false,showStepNumbers:false});
    onDemandGuide.start();
}

function createAidStep(stepMessage, elementId){
    var newStep = {};
    newStep.element=elementId;
    newStep.intro=stepMessage;
    newStep.position="bottom";
    return newStep;
}

function showIntroGuide(currentTrip){
    //TODO the introguide should only be displayed when it is the first trip, i.e., when you started collecting data with MEILI
    var introguide = introJs();

    if (getLanguage()=="en")
    introguide.setOptions({
        steps: [
            {
                element: '#map', // TODO logo
                intro: 'Welcome to <b>MEILI!</b> Since this is your first time using the system, we will provide you with a quick overview of what you can do.',
                position: 'right',
                scrollToElement:false
            },
            {
                element: '#map',
                intro: 'This is the map, where your trips and triplegs will be shown. You can also interact with these elements. <br > More on this later.',
                position: 'right',
                scrollToElement:false
            },
            {
                element: '#timeline', // TODO timeline
                intro: 'This is the timeline. This contains a summary of your trips and triplegs. At any given point, you can see only one trip and its triplegs. You can also interact with these elements. <br > More on this later',
                position: 'left',
                scrollToElement:false
            },
            {
                element: '#firstTimelinePanel',
                intro: 'When you start annotating your trips, you will always have a summary of what happened in the previous trip so that it is easier to understand what data are presented to you. This will be visible after you finish annotating your first trip.',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO tripleg element
                intro: 'This panel represents a tripleg, which is an automatically detected part of your trip that MEILI thinks you have traveled with a single travel mode.',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO tripleg element time
                intro: 'For each tripleg we recommend verifying the start and end times (<i class="glyphicon glyphicon-time"></i> icons) that MEILI suggests, just to make sure that it didn\'t make a mistake.',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#selectbasic'+currentTrip.triplegs[0].triplegid, //TODO tripleg element mode
                intro: 'For each tripleg, MEILI tries to predict your travel mode. Please confirm or correct it using this dropdown list.',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO tripleg element station
                intro: 'Finally, you can also help MEILI to improve by specifying the place where you transferred if your trip contains more than one triplegs.',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#lastTimelinePanel', //TODO Last trip element
                intro: 'After verifying your triplegs, MEILI suggests investigating the final trip panel.',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#placeSelect', //TODO Last trip element
                intro: 'MEILI tries to predict your destination. Please confirm or correct it by selecting a destination from the dropdown list or by defining a new personal destination (last in dropdown list).',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#purposeSelect', //TODO Last trip element
                intro: 'MEILI tries to predict your trip\'s purpose. Please confirm or correct it by selecting the most appropriate purpose from the dropdown list.',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#map', // TODO MAP
                intro: 'Every modification that you make on the timeline will also be present on the map. The used symbology for displaying information on the map is the following: ' +
                '<br > <img src="../images/start_flag.png" height="15" width="15"></img> the location at which your trip started' +
                '<br > <img src="../images/stop_flag.png" height="15" width="15"></img> the location at which your trip ended ' +
                '<br > <img src="../images/transition.png" height="15" width="15"></img> a location at which your transfered between modes' +
                '<br > <img src="../images/regpoint.png" height="15" width="15"></img> a regular location' +
                '<br > <img src="../images/route.png" height="15" width="35"></img> your route. Double click it to alter its shape' +
                '<br > <img src="../images/Bus.png" height="15" width="15"></img> the place where you transfered.' +
                '<br > <img src="../images/Bus.png" height="15" width="15"></img> the place where you parked.' +
                '<br > <img src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-128.png" height="15" width="15"></img> your destination.',
                position: 'floating',
                scrollToElement:false
            },
            {
                element: '#timeline', //TODO TIMELINE ELEMENT
                intro: 'This last part walks you through what to do if MEILI is showing wrong information.',
                position: 'left',
                scrollToElement:false
            },
            {
                element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO Tripleg ELEMENT
                intro: 'If the start or end time of a tripleg are wrong, please adjust their time from the time picker menus (<i class="glyphicon glyphicon-time"></i> icons).',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO TIMELINE ELEMENT
                intro: 'A noisy tripleg can be deleted by pressing the <i class="glyphicon glyphicon-trash"></i> button, but this is only an option when the trip has more than one triplegs.',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO TIMELINE ELEMENT
                intro: 'If your trip\'s start or end time are wrong, please adjust the start time from the first tripleg and the end time from the last tripleg (<i class="glyphicon glyphicon-time"></i> icons).',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#tldatefirst', //TODO TIMELINE ELEMENT
                intro: 'If this is not a trip, and you want to delete it, you can press the <i class="glyphicon glyphicon-trash"></i> button.',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#tldatelast', //TODO TIMELINE ELEMENT
                intro: 'If this is not where the trip ended, you can press this <i class="glyphicon glyphicon-share-alt"></i> button to merge this trip with the next one.',
                position: 'bottom',
                scrollToElement:false
            },
            {
                element: '#map', //TODO TIMELINE ELEMENT
                intro: 'Similarly, you can handle a trip\'s modification from the map. You can select any location and then specify that your trip started / ended there or that you made a transfer there.',
                position: 'right',
                scrollToElement:false
            },
            {
                element: '#map', //TODO TIMELINE ELEMENT
                intro: 'You can edit any of the places that you added (<img src="../images/Bus.png" height="15" width="15"></img>,<img src="../images/mark2.png" height="15" width="15"></img>) by clicking on their icons.',
                position: 'right',
                scrollToElement:false
            },
            {
                element: '#assistant', //TODO TIMELINE ELEMENT
                intro: 'This is about it from me, I\'ll let you enjoy annotating your trips. If in doubt or need help, you can always access the assistant <span class="glyphicon glyphicon-info-sign"></span>, which will help you annotate your trips.',
                position: 'bottom',
                scrollToElement:false
            }
        ],scrollToElement:false,
        showStepNumbers:false,
    showProgress:false,showBullets:false});

    else

        introguide.setOptions({
            steps: [
                {
                    element: '#map', // TODO logo
                    intro: 'Välkommen till <b>MEILI!</b> Eftersom det är första gången du använder systemet får du nu en överblick över vad du kan göra.',
                    position: 'right',
                    scrollToElement:false
                },
                {
                    element: '#map',
                    intro: 'Det här är kartan där dina förflyttningar kommer att visas. Du kan också klicka i kartan. <br > Mer om detta senare. ',
                    position: 'right',
                    scrollToElement:false
                },
                {
                    element: '#timeline', // TODO timeline
                    intro: 'Det här är tidslinjen. Här sammanställs dina förflyttningar. Du kan bara se en förflyttning i taget. Du kan också klicka på tidslinjen. ',
                    position: 'left',
                    scrollToElement:false
                },
                {
                    element: '#firstTimelinePanel',
                    intro: 'När du granskar och justerar dina resor kommer du se en sammanfattning av den föregående förflyttningen. ',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO tripleg element
                    intro: 'Den här rutan representerar en förflyttning. MEILI föreslår automatiskt vilka förflyttningar systemet tror att du har genomfört med ett och samma färdsätt. ',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO tripleg element time
                    intro: 'Var god granska och vid behov justera start och sluttid för varje förflyttning. ',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#selectbasic'+currentTrip.triplegs[0].triplegid, //TODO tripleg element mode
                    intro: 'Var god granska och vid behov justera färdsätt för varje förflyttning.',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO tripleg element station
                    intro: 'Du kan också hjälpa MEILI att förbättras genom att ange bytespunkt (om din resa innehåller flera färdsätt).',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#lastTimelinePanel', //TODO Last trip element
                    intro: 'Var god granska även rutan längst ner på sidan med information om målpunkt och ärende.',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#placeSelect', //TODO Last trip element
                    intro: 'MEILI försöker förutspå din målpunkt. Godkänn eller ändra genom att välja en målpunkt från listan eller ange en ny målpunk (sista alternativet i listan).',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#purposeSelect', //TODO Last trip element
                    intro: 'MEILI försöker förutspå ärendet för din förflyttning. Godkänn eller ändra genom att välja det mest passande ärendet från listan.',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#map', // TODO MAP
                    intro: 'Varje ändring som du gör på tidslinjen kommer också att visas på kartan. Symbolerna som används för att visa information på kartan är följande:' +
                    '<br > <img src="../images/start_flag.png" height="15" width="15"></img> platsen där din förflyttning startade' +
                    '<br > <img src="../images/stop_flag.png" height="15" width="15"></img> platsen där din förflyttning slutade' +
                    '<br > <img src="../images/transition.png" height="15" width="15"></img> plats där du bytte färdsätt' +
                    '<br > <img src="../images/regpoint.png" height="15" width="15"></img>  en registreringspunkt under förflyttningen' +
                    '<br > <img src="../images/route.png" height="15" width="35"></img> din resväg; dubbelklicka för att ändra' +
                    '<br > <img src="../images/Bus.png" height="15" width="15"></img> platsen där du gjorde ett byte' +
                    '<br > <img src="../images/Bus.png" height="15" width="15"></img> platsen där du parkerade' +
                    '<br > <img src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-128.png" height="15" width="15"></img> din målpunkt.',
                    position: 'floating',
                    scrollToElement:false
                },
                {
                    element: '#timeline', //TODO TIMELINE ELEMENT
                    intro: 'Den här sista delen hjälper dig hur du ska göra om MEILI visar fel information.',
                    position: 'left',
                    scrollToElement:false
                },
                {
                    element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO Tripleg ELEMENT
                    intro: 'Om start eller sluttid för en förflyttning är fel, ändra tiden genom att klicka på klockan (<i class="glyphicon glyphicon-time"></i> ikoner).',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO TIMELINE ELEMENT
                    intro: 'En felaktig förflyttning kan tas bort genom att klicka på <i class="glyphicon glyphicon-trash"></i>. Detta kan bara göras om det finns mer än ett färdsätt.',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#telem'+currentTrip.triplegs[0].triplegid, //TODO TIMELINE ELEMENT
                    intro: 'Om din förflyttnings start eller sluttid är fel, ändra din starttid för första färdsätt och din sluttid för sista färdsätt (<i class="glyphicon glyphicon-time"></i> ikoner).',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#tldatefirst', //TODO TIMELINE ELEMENT
                    intro: 'Om detta inte är en förflyttning så kan du ta bort den genom att klicka på <i class="glyphicon glyphicon-trash"></i>.',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#tldatelast', //TODO TIMELINE ELEMENT
                    intro: 'Om detta inte är målpunkten för förflyttningen , klicka på <i class="glyphicon glyphicon-share-alt"></i> för att sammanfoga den med nästa förflyttning.',
                    position: 'bottom',
                    scrollToElement:false
                },
                {
                    element: '#map', //TODO TIMELINE ELEMENT
                    intro: 'Du kan hantera och ändra en förflyttning via kartan. Du kan markera vilken plats du vill och ange att förflyttningen startade/slutade där eller att du gjorde ett byte där.',
                    position: 'right',
                    scrollToElement:false
                },
                {
                    element: '#map', //TODO TIMELINE ELEMENT
                    intro: 'Du kan ändra alla platser/målpunkter som du lagt till genom att klicka på dess ikoner (<img src="../images/Bus.png" height="15" width="15"></img>,<img src="../images/mark2.png" height="15" width="15"></img>)',
                    position: 'right',
                    scrollToElement:false
                },
                {
                    element: '#assistantSv', //TODO TIMELINE ELEMENT
                    intro: 'Detta var all information från lathunden. Om du behöver ytterligare hjälp så kan du klicka på hjälpknappen <span class="glyphicon glyphicon-info-sign"></span>. Du kan då få hjälp av vår support att granska dina resor.',
                    position: 'bottom',
                    scrollToElement:false
                }
            ],scrollToElement:false,
            showStepNumbers:false,
            showProgress:false,showBullets:false})

    /*introguide.onchange(function(targetElement) {

        console.log('changed');
        console.log(targetElement);
    });

    introguide.onbeforechange(function(targetElement) {
         console.log('before change');
        console.log(targetElement);
    });*/

    introguide.start();

}

function forceLoad(){

   // disableScroll();

    console.log('force load');
 //   document.getElementById("language-select").onchange();
 //   console.log('calling lang select');
    //select_language('en');
    //var theLanguage = $('body').attr('lang');
    //alert(theLanguage);
}

function getLanguage(){
    return "en";//document.getElementById("language-select").options[document.getElementById("language-select").selectedIndex].value;
}

var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
    if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove  = preventDefault; // mobile
    document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
}