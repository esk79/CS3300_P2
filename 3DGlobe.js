/**
 * Created by EvanKing on 4/18/16.
 */
d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

var width = 1440,
    height = 750;

var colorScale = d3.scale.linear().domain([0, 10]).range(['#8b0000', '#004499']) //just two random colors for now
var radiusScale = d3.scale.sqrt().domain([0, 10]).range([0, 20])

var proj = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .scale(350);

var sky = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .scale(300);

var path = d3.geo.path().projection(proj).pointRadius(function (d) {
    if (d.type != "MultiPolygon") {
        return d.properties.radius
    }
});

var links = [],
    points = []

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", mousedown);

queue()
    .defer(d3.json, "world-110m.json")
    .defer(d3.csv, "data.csv")
    .await(ready);

//for debug
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
        .attr("cx", 500).attr("cy", 675)
        .attr("rx", proj.scale() * 1.3)
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

    var clicked = "GDP/capita"
    list = createList(clicked)
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

    // plot points on map from geoJSON objects
    svg.append("g").attr("class", "points")
        .selectAll("text").data(points)
        .enter().append("path")
        .attr("class", "point")
        .style("fill", function (d) {
            return d.properties.color
        })
        .on("click", function (d) { // this doesn't appear to work
            console.log(d.properties.country);
        })
        .attr("d", path);

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

//http://stackoverflow.com/questions/2466356/javascript-object-list-sorting-by-object-property
function sortObj(list, key, increase) {
    function compare(a, b) {
        a = parseFloat(a[key]);
        b = parseFloat(b[key]);
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    }

    var sorted = list.sort(compare).filter(function (d) {
        return d[key] != ".."
    })
    colorScale.domain([sorted[0][key], sorted[sorted.length - 1][key]])
    radiusScale.domain([sorted[0][key], sorted[sorted.length - 1][key]])
    return increase ? sorted.reverse() : sorted
}

increaseList = ["HDI", "GDP/capita"]
function createList(clicked) {
    increase = (increaseList.indexOf(clicked) >= 0)
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

function createTable(data, columns, problem) {
    var table = d3.select(problem).append("table").attr("class", "container")

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
        .html(function (d) {
            return d.value;
        });

    return table;
}

