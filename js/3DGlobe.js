/**
 * Created by EvanKing on 4/18/16.
 */

d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

var width = 850,
    height = 750;

var colorScale = d3.scale.linear().domain([0, 10]).range(['#8b0000', '#004499']) //just two random colors for now
var radiusScale = d3.scale.sqrt().domain([0, 10]).range([0, 20])

var f = d3.format(".3f")

//http://stackoverflow.com/questions/2474009/browser-size-width-and-height
function getWindowSize(){
    var d= document, root= d.documentElement, body= d.body;
    var wid= window.innerWidth || root.clientWidth || body.clientWidth,
        hi= window.innerHeight || root.clientHeight || body.clientHeight ;
    return [wid,hi]
}

var proj = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .scale(getWindowSize()[0]/4.8)
    .scale(width*.34);

var sky = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .scale(width*.3);

var path = d3.geo.path().projection(proj).pointRadius(function (d) {
    if (d.type != "MultiPolygon") {
        return d.properties.radius
    }
});

//var pathPoints = d3.geo.path().projection(proj).pointRadius(d.properties.radius

var links = [],
    points = []

var svg = d3.select("body").append("svg")
    .attr("class", "globe")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", mousedown);


var svgColor = d3.select("body").append("svg")
    .attr("class", "scale")
    .attr("width", "300px")
    .attr("height", "100px");

var y = 40
var r = 2;
var e = .4
for(x = 10; x < 250; x += e*45){
    svgColor.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", radiusScale(r))
        .attr("fill", colorScale(r));
    r+=2
    e+=.15
}

svgColor.append("text")
    .text("low")
    .attr("x", 0)
    .attr("y", 90)
    .attr("fill", "#A7A1AE")

svgColor.append("text")
    .text("high")
    .attr("x", 190)
    .attr("y", 90)
    .attr("fill", "#A7A1AE")

queue()
    .defer(d3.json, "data/world-110m.json")
    .defer(d3.csv, "data/data.csv")
    .await(ready);

var countryStats;
function ready(error, world, data) {
    if (error)   //If error is not null, something went wrong.
        console.log(error) //Log the error.

    countryStats = data;

    var ocean_fill = svg.append("defs").append("radialGradient")
        .attr("id", "ocean_fill")
        .attr("cx", "75%")
        .attr("cy", "25%");
    ocean_fill.append("stop").attr("offset", "5%").attr("stop-color", "#fff");
    ocean_fill.append("stop").attr("offset", "100%").attr("stop-color", "#ababab");
    // console.log(ocean_fill);

    var globe_highlight = svg.append("defs").append("radialGradient")
        .attr("id", "globe_highlight")
        .attr("cx", "75%")
        .attr("cy", "25%");
    globe_highlight.append("stop")
        .attr("offset", "5%").attr("stop-color", "#ffd")
        .attr("stop-opacity", "0.6");
    globe_highlight.append("stop")
        .attr("offset", "100%").attr("stop-color", "#ba9")
        .attr("stop-opacity", "0.2");

    var globe_shading = svg.append("defs").append("radialGradient")
        .attr("id", "globe_shading")
        .attr("cx", "55%")
        .attr("cy", "45%");
    globe_shading.append("stop")
        .attr("offset", "30%").attr("stop-color", "#fff")
        .attr("stop-opacity", "0")
    globe_shading.append("stop")
        .attr("offset", "100%").attr("stop-color", "#505962")
        .attr("stop-opacity", "0.3")

    var drop_shadow = svg.append("defs").append("radialGradient")
        .attr("id", "drop_shadow")
        .attr("cx", "50%")
        .attr("cy", "50%");
    drop_shadow.append("stop")
        .attr("offset", "20%").attr("stop-color", "#000")
        .attr("stop-opacity", ".5")
    drop_shadow.append("stop")
        .attr("offset", "100%").attr("stop-color", "#000")
        .attr("stop-opacity", "0")

    svg.append("ellipse")
        .attr("cx", 400).attr("cy", 675)
        .attr("rx", proj.scale() * 1)
        .attr("ry", proj.scale() * .25)
        .attr("class", "noclicks")
        .style("fill", "url(#drop_shadow)");

    svg.append("circle")
        .attr("cx", width / 2).attr("cy", height / 2)
        .attr("r", proj.scale())
        .attr("class", "noclicks")
        .style("fill", "url(#ocean_fill)");

    svg.append("path")
        .datum(topojson.object(world, world.objects.land))
        .attr("class", "land noclicks")
        .attr("d", path);

    svg.append("circle")
        .attr("cx", width / 2).attr("cy", height / 2)
        .attr("r", proj.scale())
        .attr("class", "noclicks")
        .style("fill", "url(#globe_highlight)");

    svg.append("circle")
        .attr("cx", width / 2).attr("cy", height / 2)
        .attr("r", proj.scale())
        .attr("class", "noclicks")
        .style("fill", "url(#globe_shading)");

    clicked("Life Expectancy")
}

function refresh() {
    svg.selectAll(".land").attr("d", path);
    svg.selectAll(".point").attr("d", path);
}

// modified from http://bl.ocks.org/1392560
var m0, o0;
function mousedown() {
    m0 = [d3.event.pageX, d3.event.pageY];
    o0 = proj.rotate();
    d3.event.preventDefault();
}
function mousemove() {
    if (m0) {
        var m1 = [d3.event.pageX, d3.event.pageY]
            , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
        o1[1] = o1[1] > 30 ? 30 :
            o1[1] < -30 ? -30 :
                o1[1];
        proj.rotate(o1);
        sky.rotate(o1);
        refresh();
    }
}
function mouseup() {
    if (m0) {
        mousemove();
        m0 = null;
    }
}

var reverseList = ["Gender Equality Rank", "Governance Index"]
//http://stackoverflow.com/questions/2466356/javascript-object-list-sorting-by-object-property
function sortObj(list, clicked, increase) {
    var reverse = (reverseList.indexOf(clicked) >= 0)
    var filtered = list.filter(function (d) {
        return !isNaN(d[clicked])
    })

    function compare(a, b) {
        a = parseFloat(a[clicked]);
        b = parseFloat(b[clicked]);
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }

    var sorted = filtered.sort(compare)
    if (!reverse) {
        colorScale.domain([sorted[0][clicked], sorted[sorted.length - 1][clicked]])
        radiusScale.domain([sorted[0][clicked], sorted[sorted.length - 1][clicked]])
    } else {
        colorScale.domain([sorted[sorted.length - 1][clicked], sorted[0][clicked]])
        radiusScale.domain([sorted[sorted.length - 1][clicked], sorted[0][clicked]])
    }

    return increase ? sorted : sorted.reverse()
}

increaseList = ["Gender Equality Rank", "Governance Index"]
function createList(clicked) {
    var increase = (increaseList.indexOf(clicked) >= 0)
    sorted = sortObj(countryStats, clicked, increase)
    sorted.forEach(function (d) {
        if (d[clicked] != "..") {
            links.push({
                coord: [d.Long, d.Lat],
                color: colorScale(d[clicked]),
                radius: radiusScale(d[clicked]),
                country: d.Country
            })
        }
    })
    return sorted
}

function createTable(data, columns, divData) {
    var index = 1
    var table = d3.select(divData).append("table").attr("class", "container")
    var thead = table.append("thead").append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function (column) {
            return column;
        });

    var tbody = table.append("tbody");

    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    rows.selectAll("td")
        .data(function (row) {
            return columns.map(function (column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .html(function (d, i) {
            if (d.column != "Country") {
                index = data.map(function (e) {
                        return e[columns[1]];
                    }).indexOf(d.value) + 2
                return f(d.value)
            }
            if (d.column == "Country")
                return index + ") " + d.value

        });

    return table;
}

/* 
    function to create a bar chart taking inputs: 
        div id where chart goes,
        associative array of chart margins, 
        width and height of chart, 
        country whose stats to display. 
    tutorials/references used: 
        http://jrue.github.io/coding/2014/exercises/basicbarchart/
        https://bl.ocks.org/mbostock/ 
*/
function genBarChart (divid, margins, width, height, country) {
    d3.csv("data/data.csv", function(d) {
        return {
            // associate data labels to quantitative form of data
            // these double as accessor variables & x-axis labels
            Country : d.Country,
            HDI : +d["HDI rank"],
            WellBeing : +d["Well-Being rank"],
            LifeExp : +d["Life Expectancy rank"],
            GDP : +d["GDP/capita rank"],
            Footprint : +d["Foot-print rank"],
            GovIndex : +d["Governance Index rank"],
            EduIneq : +d["Inequality in education rank"],
            Incarceration : +d["Incarceration Rate rank"],
            Suicide : +d["Suicide Rate rank"],
            Homicide : +d["Homocide Rate rank"],
            IncomeIneq : +d['Income Inequality rank']
        };
    }, function (error, data) {

        if (error) throw error;

        // get all variables/labels except the country
        var colNames = d3.keys(data[0]).filter(function(key) { return key !== "Country"; });


        // for the given country, create associative array mapping the country name to the 'key' key, 
        // the variable names to the 'name' key, and the variable values to the 'value' key
        data.forEach(function (d) {
            if (d.Country == country) {
                d.nameval = colNames.map(function(name) { return { key : d.Country, name: name, value: +d[name]}; });
            };
        });

        var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, width - margins.right - margins.left], .1)
        .domain(colNames.map(function (d) { return d; }));

        var yScale = d3.scale.linear()
        .range([1, height - margins.bottom - margins.top])
        .domain([1, data.length+1]);

        var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

        var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

        // append svg to given div id
        // and set data to tuple of given country
        var svg = d3.select(divid)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
        .data(data.filter(function(d) { 
            if(d.Country == country) {
                return d;
            };
        }));

        // set data for bars to name-key-value
        // associative array and append bars
        var barGroup = svg.selectAll(".bar")
        .data(function(d) {return d.nameval; })
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return margins.left + xScale(d.name);})
        .attr("y", function (d) { if(isNaN(d.value) || isNaN(d.value)) { d.value = 0; }; return height - margins.bottom - margins.top - yScale((data.length-d.value+1)); })
        .attr("height", function (d) { if(isNaN(d.value) || isNaN(d.value)) { d.value = 0; }; return yScale((data.length-d.value+1)); })
        .attr("width", xScale.rangeBand()-1);
        
        // append y-axis
        svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + margins.left + "," + 0 + ")")
        .call(yAxis);

        // append x-axis
        svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(" + margins.left + "," +  (height - margins.bottom - margins.top) + ")")
        .call(xAxis);

        // append title
        svg.append("text")
        .attr("class", "label")
        .attr("transform", "translate("+(width/2)+",0)")
        .text(country + "'s ranking in different areas");

        // append y-axis label
        svg.append("text")
        .attr("class", "label")
        .attr("transform", "translate(15" + "," + ((height/2)-(height/8)) + ")rotate(-90)")
        .text("rank (1st to 152nd)");

        // append x-axis label
        svg.append("text")
        .attr("class", "label")
        .attr("transform", "translate("+(width/2)+","+(height-margins.bottom-10)+")")
        .text("variables");

        });
}

function clicked(clicked) {
    links = []
    points = []

    d3.selectAll(".points").remove()

    list = createList(clicked)

    var oldTable = document.getElementById("table");

    if (oldTable) {
        // console.log("removing")
        oldTable.remove()
    }
    var table = document.createElement('div');
    table.id = 'table';
    document.body.appendChild(table)

    createTable(list, ["Country", clicked], table)
    // build geoJSON features from links array for points
    links.forEach(function (e, i, a) {
        var point = {
            "type": "Feature",
            "properties": {
                "radius": e.radius,
                "color": e.color,
                "country": e.country
            },
            "geometry": {
                "type": "Point",
                "coordinates": e.coord
            }
        };
        points.push(point)
    })

    var gMargins = {top:40, right:40, bottom:50, left:40};
    var gWidth = 550;
    var gHeight = 325;

    d3.select("#hist").select("svg").remove();
    genBarChart("#hist", gMargins, gWidth, gHeight, "United States of America");

    // plot points on map from geoJSON objects
    svg.append("g").attr("class", "points")
        .selectAll("text").data(points)
        .enter().append("path")
        .attr("class", "point")
        .style("fill", function (d) {
            return d.properties.color
        })
        .on("click", function (d) { // this doesn't appear to work
            d3.select("#hist").select("svg").remove();
            genBarChart("#hist", gMargins, gWidth, gHeight, d.properties.country);
        })
        .attr("d", path);

    refresh()
}
