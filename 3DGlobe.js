/**
 * Created by EvanKing on 4/18/16.
 */
d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

var width = 960,
    height = 500;

var proj = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .scale(220);

var sky = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .clipAngle(90)
    .scale(300);

var path = d3.geo.path().projection(proj).pointRadius(function (d) {
    if (d.type != "MultiPolygon") {
        return d.properties.radius
    }
});

var swoosh = d3.svg.line()
    .x(function (d) {
        return d[0]
    })
    .y(function (d) {
        return d[1]
    })
    .interpolate("cardinal")
    .tension(.0);

var links = [],
    points = [];

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", mousedown);

queue()
    .defer(d3.json, "world-110m.json")
    .await(ready);

function ready(error, world) {
    if (error)   //If error is not null, something went wrong.
        console.log(error) //Log the error.

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
        .attr("cx", 440).attr("cy", 450)
        .attr("rx", proj.scale() * .90)
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

    links.push({
        coord: [-122.3321, 47.6062], //seattle
        color: "red"                 //just a stub color
    })

    // build geoJSON features from links array for points
    links.forEach(function (e, i, a) {
        var point = {
            "type": "Feature",
            "properties": {
                "radius": 15,
                "color": e.color
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
        .style("fill", function (d) { return d.properties.color })
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
