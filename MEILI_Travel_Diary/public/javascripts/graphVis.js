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

// init

var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var days_num = [0,1,2,3,4,5,6];
var days_sv = ['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'];
var hours_st = ['12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM'];
var hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
var modes = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
var modes_sv = ['Till fots', 'Cykel', 'Moped', 'Bil (förare)', 'Bil (pass)', 'Taxi', 'Färdtjänst', 'Buss', 'Tunnelbana', 'Spårvagn', 'Pendeltåg','Tåg', 'Färja / båt', 'Flyg', 'Övrigt'];
var modes_en = ['Walk', 'Bicycle', 'Moped', 'Car (driver)', 'Car (pass)', 'Taxi', 'Paratransit', 'Bus', 'Subway', 'Tram', 'Commuter train', 'Train', 'Ferryboat', 'Flight','Other'];
var margin = {top: 10, right: 10, bottom: 10, left: 15}
var width = 960 - margin.left - margin.right
var height = 405 - margin.top - margin.bottom
var padding = 3
var xLabelHeight = 30
var yLabelWidth = 80
var borderWidth = 3
var duration = 500
var steps = [];
var co2 = [];
var modesV = [];
var stepsSV = [];
var co2SV = [];
var modesVSV = [];

function changeLoad(){
    var x = document.getElementById("selectStatType").value;
    if (x==2){
        if (getLanguage()=="en")
        update(co2, hours_st);
        else
        update(co2SV,hours_st)
    }
    else
    if (x==3){
        if (getLanguage()=="en")
        update(steps, hours_st);
        else update(stepsSV,hours_st)
    }
    else if (x==1){
        if (getLanguage()=="en")
        update(modesV,modes_en);
        else update(modesVSV,modes_sv)
    }
}

function initGraphs(userId){

    // ajax request to server

    // toggle waiting class
     // select * from ap_get_user_stats(user_id)
    hourglassOn();
    // when done call draw (args)

    var request = $.ajax({
        url: "/api/getUserStats",
        type: "POST",
        data: {user_id:userId},
        cache: false
    });
    $.when(request).done(function (msg) {
        console.log(msg);
        if (msg!='empty')
        drawGraphs(getJson(msg.ap_get_user_stats)[0]);
        else alert('not enough data');
    });
}



function hourglassOn() {
    if ($('style:contains("html.wait")').length < 1) $('<style>').text('html.wait, html.wait * { cursor: wait !important; }').appendTo('head');
    $('html').addClass('wait');
}

function hourglassOff() {
    $('html').removeClass('wait');
}

function drawGraphs(drawElem){

    hourglassOff();
    console.log(drawElem);

    var dataCO = [];
    var dataSteps = [];
    var dataModes = [];

    var dataCOSv = [];
    var dataStepsSV = [];
    var dataModesSv = [];

    var labelsX = hours;

    for (var j in days_num){

        var stepVals = [];
        var coVals = [];
        var modeVals = [];
        for (var k=0; k<hours.length;k++){
            var foundIt = false;
            for (var i in drawElem.co_steps){
                //console.log(drawElem.co_steps[i].dow_ +'=='+ days_num[j] +'&&'+ drawElem.co_steps[i].hour_ +'=='+ hours[k]+' is '+(drawElem.co_steps[i].dow_ == days_num[j] && drawElem.co_steps[i].hour_ == hours[k]))
                if (drawElem.co_steps[i].dow_ == days_num[j] && drawElem.co_steps[i].hour_ == hours[k]){
                    foundIt = true;
                    //dataSteps[j].label = days_num[j];
                    stepVals[k] = parseInt(drawElem.co_steps[i].co2);
                    //dataCO[j].label = days_num[j];
                    coVals[k] = parseInt(drawElem.co_steps[i].steps);
                   // console.log(drawElem.co_steps[i].co2);
                 //   console.log(drawElem.co_steps[i].steps);
                }
            }

            if (!foundIt) {
                /*dataSteps[j] = [];
                dataCO[j] = [];*/
                //dataSteps[j].label = days_num[j];
                stepVals[k] = 0;
                //dataCO[j].label = days_num[j];
                coVals[k] = 0;
            }
        }

        for (var k in modes){
            var foundIt = false;
            for (var i in drawElem.modes_per_day){
                //console.log(drawElem.co_steps[i].dow_ +'=='+ days_num[j] +'&&'+ drawElem.co_steps[i].hour_ +'=='+ hours[k]+' is '+(drawElem.co_steps[i].dow_ == days_num[j] && drawElem.co_steps[i].hour_ == hours[k]))
                if (drawElem.modes_per_day[i].dow_ == days_num[j] && drawElem.modes_per_day[i].type_of_transport == modes[k]){
                    foundIt = true;
                    modeVals[k] = parseInt(drawElem.modes_per_day[i].avg);
                }
            }

            if (!foundIt) {
                modeVals[k] = 0;
            }
        }

        console.log(modeVals);

        dataSteps.push({
            label: days[j],
            values: stepVals
        });

        dataStepsSV.push({
            label: days_sv[j],
            values: stepVals
        });

        dataCO.push({
            label: days[j],
            values: coVals
        });

        dataCOSv.push({
            label: days_sv[j],
            values: coVals
        });

        dataModes.push({
            label: days[j],
            values: modeVals
        });

        dataModesSv.push({
            label: days_sv[j],
            values: modeVals
        });
    }

    //console.log(dataSteps);
    console.log(dataModes);
    console.log(dataCO);

    steps = dataSteps;
    stepsSV = dataStepsSV;

    co2 = dataCO;
    co2SV = dataCOSv;

    modesV= dataModes;
    modesVSV = dataModesSv;

    if (getLanguage()=="en")
    update(modesV,modes_en);
    else
        update(modesVSV,modes_sv);
}

function update(data, labelsX) {
    d3.select("svg").remove();

    var chart = d3.select('#chart').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var border = chart.append('rect')
        .attr('x', yLabelWidth)
        .attr('y', xLabelHeight)
        .style('fill-opacity', 0)
        .style('stroke', '#000')
        .style('stroke-width', borderWidth)
        .style('shape-rendering', 'crispEdges');

    var allValues = Array.prototype.concat.apply([], data.map(function(d) { return d.values }))
    var maxWidth = d3.max(data.map(function(d) { return d.values.length }))
    var maxR = d3.min([(width - yLabelWidth) / maxWidth, (height - xLabelHeight) / data.length]) / 2

    var r = function(d) {
        if (d === 0) return 0

        f = d3.scale.sqrt()
            .domain([d3.min(allValues), d3.max(allValues)])
            .rangeRound([2, maxR - padding])

        return f(d)
    }

    var c = d3.scale.linear()
        .domain([d3.min(allValues), d3.max(allValues)])
        .rangeRound([255 * 0.8, 0])

    var rows = chart.selectAll('.row')
        .data(data, function(d){ return d.label })

    rows.enter().append('g')
        .attr('class', 'row')

    rows.exit()
        .transition()
        .duration(duration)
        .style('fill-opacity', 0)
        .remove()

    rows.transition()
        .duration(duration)
        .attr('transform', function(d, i){ return 'translate(' + yLabelWidth + ',' + (maxR * i * 2 + maxR + xLabelHeight) + ')' })

    var dots = rows.selectAll('circle')
        .data(function(d){ return d.values })

    dots.enter().append('circle')
        .attr('cy', 0)
        .attr('r', 0)
        .style('fill', '#ffffff')
        .text(function(d){ return d })

    dots.exit()
        .transition()
        .duration(duration)
        .attr('r', 0)
        .remove()

    dots.transition()
        .duration(duration)
        .attr('r', function(d){ return r(d) })
        .attr('cx', function(d, i){ return i * maxR * 2 + maxR })
        .style('fill', function(d){ return 'rgb(' + c(d) + ',' + c(d) + ',' + c(d) + ')' })

    var dotLabels = rows.selectAll('.dot-label')
        .data(function(d){ return d.values })

    var dotLabelEnter = dotLabels.enter().append('g')
        .attr('class', 'dot-label')
        .on('mouseover', function(d){
            var selection = d3.select(this)
            selection.select('rect').transition().duration(100).style('opacity', 1)
            selection.select("text").transition().duration(100).style('opacity', 1)
        })
        .on('mouseout', function(d){
            var selection = d3.select(this)
            selection.select('rect').transition().style('opacity', 0)
            selection.select("text").transition().style('opacity', 0)
        })

    dotLabelEnter.append('rect')
        .style('fill', '#000000')
        .style('opacity', 0)

    dotLabelEnter.append('text')
        .style('text-anchor', 'middle')
        .style('fill', '#ffffff')
        .style('opacity', 0)

    dotLabels.exit().remove()

    dotLabels
        .attr('transform', function(d, i){ return 'translate(' + (i * maxR * 2) + ',' + (-maxR) + ')' })
        .select('text')
        .text(function(d){ return d })
        .attr('y', maxR + 4)
        .attr('x', maxR)

    dotLabels
        .select('rect')
        .attr('width', maxR * 2)
        .attr('height', maxR * 2)

    var xLabels = chart.selectAll('.xLabel').data(labelsX);

    xLabels.enter().append('text')
        .attr('y', xLabelHeight)
        .attr('transform', 'translate(0,-6)')
        .style('text-anchor', 'middle')
        .style('fill-opacity', 0)
        .attr('class', 'xLabel')
    ;


    xLabels.exit()
        .transition()
        .duration(duration)
        .style('fill-opacity', 0)
        .remove()

    xLabels.transition()
        .text(function (d) { return d })
        .duration(duration)
        .attr('x', function(d, i){ return maxR * i * 2 + maxR + yLabelWidth })
        .style('fill-opacity', 1)


    var yLabels = chart.selectAll('.yLabel')
        .data(data, function(d){ return d.label })

    yLabels.enter().append('text')
        .text(function (d) { return d.label })
        .attr('x', yLabelWidth)
        .attr('class', 'yLabel')
        .style('text-anchor', 'end')
        .style('fill-opacity', 0)

    yLabels.exit()
        .transition()
        .duration(duration)
        .style('fill-opacity', 0)
        .remove()

    yLabels.transition()
        .duration(duration)
        .attr('y', function(d, i){ return maxR * i * 2 + maxR + xLabelHeight })
        .attr('transform', 'translate(-6,' + maxR / 2.5 + ')')
        .style('fill-opacity', 1)

    var vert = chart.selectAll('.vert')
        .data(labelsX)

    vert.enter().append('line')
        .attr('class', 'vert')
        .attr('y1', xLabelHeight + borderWidth / 2)
        .attr('stroke', '#888')
        .attr('stroke-width', 1)
        .style('shape-rendering', 'crispEdges')
        .style('stroke-opacity', 0)

    vert.exit()
        .transition()
        .duration(duration)
        .style('stroke-opacity', 0)
        .remove()

    vert.transition()
        .duration(duration)
        .attr('x1', function(d, i){ return maxR * i * 2 + yLabelWidth })
        .attr('x2', function(d, i){ return maxR * i * 2 + yLabelWidth })
        .attr('y2', maxR * 2 * data.length + xLabelHeight - borderWidth / 2)
        .style('stroke-opacity', function(d, i){ return i ? 1 : 0 })

    var horiz = chart.selectAll('.horiz').
        data(data, function(d){ return d.label })

    horiz.enter().append('line')
        .attr('class', 'horiz')
        .attr('x1', yLabelWidth + borderWidth / 2)
        .attr('stroke', '#888')
        .attr('stroke-width', 1)
        .style('shape-rendering', 'crispEdges')
        .style('stroke-opacity', 0)

    horiz.exit()
        .transition()
        .duration(duration)
        .style('stroke-opacity', 0)
        .remove()

    horiz.transition()
        .duration(duration)
        .attr('x2', maxR * 2 * labelsX.length + yLabelWidth - borderWidth / 2)
        .attr('y1', function(d, i){ return i * maxR * 2 + xLabelHeight })
        .attr('y2', function(d, i){ return i * maxR * 2 + xLabelHeight })
        .style('stroke-opacity', function(d, i){ return i ? 1 : 0 })

    border.transition()
        .duration(duration)
        .attr('width', maxR * 2 * labelsX.length)
        .attr('height', maxR * 2 * data.length)

}