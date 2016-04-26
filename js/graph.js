queue()
    .defer(d3.csv, "data/data.csv")
    .await(ready);

var countryStats;
function ready(error, data) {
    if (error)   //If error is not null, something went wrong.
        console.log(error) //Log the error.

// console.log(data);
    countryStats = data;
    
    // console.log(countryStats);

    headers = Object.keys(countryStats[0]);
    scatterPlot(countryStats,headers[2],headers[3]);
    assignHeaders("xValue",headers,"option",2);
    assignHeaders("yValue",headers,"option",3);
    getPoints();
}


var scatterHeight = 500;
var scatterWidth = 850;
var scatterPadding = 75;
var allPoints = []
var selectedPoints = [];
var headers = [];
var allPointsIds = [];
var graphHeaders = [];
var playStatus = false;
var timeoutStatus;

function scatterPlot (objects, xKey, yKey) {

    if(d3.selectAll("#graph>svg")[0].length < 1) {
        var svg = d3.select("#graph").append("svg")
          .attr("height", scatterHeight).attr("width", scatterWidth);
    }
    else svg = d3.select("#graph>svg");

    var xMax = 0;
    var yMax = 0;

    //max and min x and y values
    objects.forEach(function (data) {
    	var xValue = data[xKey];
    	var yValue = data[yKey];

    	if (xValue > xMax && !isNaN(xValue)) {
    		xMax = xValue*1.05;
    	}
    	if (yValue > yMax && !isNaN(yValue)) {
    		yMax = yValue*1.05;
    	}
    })

    //set up scales
    xScale = d3.scale.linear().domain([0,xMax]).range([scatterPadding, scatterWidth - scatterPadding]);
    yScale = d3.scale.linear().domain([0,yMax]).range([scatterHeight - scatterPadding,scatterPadding]);

    //add axis
    
    d3.selectAll(".axis").remove();
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
    svg.append("g").attr("class", "axis").attr("transform", "translate(0," + yScale(0) + ")").call(xAxis);

    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
    svg.append("g").attr("class", "axis").attr("transform", "translate(" + xScale(0) + ",0)").call(yAxis);

    //add graph and axis titles
    d3.selectAll(".axisTitle").remove();
    svg.append("text").attr("x",scatterWidth/3).attr("y",25).attr("class","axisTitle").
    text("Graph of " + yKey + " vs " + xKey);
    svg.append("text").attr("x",scatterWidth/2.3).attr("fill","#cccc").attr("y",scatterHeight-10)
      .attr("class","axisTitle").text(xKey);
    svg.append("text").attr("x",20).attr("y",scatterHeight/2+20).attr("transform","rotate(270,20,"+(scatterHeight/2+20)+")")
        .text(yKey).attr("class", "axisTitle");

    objects.forEach(function (data) {
        // console.log(data);
        // console.log(xKey);
        // console.log(yKey);

        var pointName = data["Country"];
     	var xValue = Number(data[xKey]);
     	var yValue = Number(data[yKey]);
        var pointID = pointName;

        if (pointName.search(" ")) {
            pointID = pointName.replace(/[\s\'\.\,]/g,"");
        }

        if(!isNaN(xValue) && !isNaN(yValue)) {
            
            if(allPointsIds.indexOf(pointID) > -1) {
                var currentPoint = document.getElementById(pointID);
                var currentLabel = document.getElementById("label" + pointID);

                currentPoint.cx.baseVal.value = xScale(xValue);
                currentPoint.cy.baseVal.value = yScale(yValue);

                currentLabel.x.baseVal[0].value = xScale(xValue-xMax*.03);
                currentLabel.y.baseVal[0].value = yScale(yValue+yMax*.03);
            }
            else {
                svg.append("circle")
                    .attr("cx",xScale(xValue))
                    .attr("cy",yScale(yValue))
                    .attr("r",5)
                    .attr("class", "graphPoint")
                    .attr("id",  pointID);

                svg.append("text")
                    .attr("x",xScale(xValue-xMax*.03))
                    .attr("y",yScale(yValue+yMax*.03))
                    .attr("class", "pointLabel")
                    .attr("id", "label" + pointID)
                    .text(pointName);
            }
        }
        else {
            d3.select("#" + pointID).remove();
            d3.select("#label" + pointID).remove();
            // console.log("removed: " + pointID);
        }
    });

    allPoints = d3.selectAll(".graphPoint");
    d3.selectAll(".selectedPoint")[0].forEach(function (point) {allPoints[0].push(point)});
    console.log(allPoints);

    allPointsIds = [];
    allPoints[0].forEach(function (point) {
        allPointsIds.push(point.id);
    });
    getPoints();
}

function getPoints () {
    allPoints.on("click", function(point) {
        if (d3.select("#" + this.id).classed("selectedPoint")) {
            replaceClassById(this.id, "selectedPoint","graphPoint");
            replaceClassById("label"+this.id,"selectedLabel","pointLabel");
            selectedPoints.splice(selectedPoints.indexOf(this.id),1);
        }

        else {
            if(selectedPoints.length < 3) {
                replaceClassById(this.id, "graphPoint","selectedPoint");
                replaceClassById("label"+this.id,"pointLabel","selectedLabel");
                selectedPoints.push(this.id);
            }
            else {
                var removePoint = selectedPoints[0];
                replaceClassById(removePoint, "selectedPoint","graphPoint");
                replaceClassById("label"+removePoint,"selectedLabel","pointLabel");
                selectedPoints.splice(0,1);
                replaceClassById(this.id, "graphPoint","selectedPoint");
                replaceClassById("label"+this.id,"pointLabel","selectedLabel");
                selectedPoints.push(this.id);
            }
        }
    });
}

function replaceClassById (id, oldClass, newClass) {
    d3.select("#" + id).classed(newClass, true)
    d3.select("#" + id).classed(oldClass, false)
}

function assignHeaders (htmlId, array, nodeType, selected) {
    var parentNode = document.getElementById(htmlId);
    graphHeaders = array.slice(2,15)

    graphHeaders.forEach(function (header) {
        var node = document.createElement(nodeType);
        var text = document.createTextNode(header);
        node.appendChild(text);
        parentNode.appendChild(node);
    })    
}

function playData () {
    var i = 0;
    var drawStatus = true;
    var xHeader = document.getElementById("xValue").value;
    reDrawGraph();
    i++;
    if(drawStatus==false){
        drawStatus=true;
        reDrawGraph();
        i++;
    }

    function dataIterator () {
        timeoutStatus = setTimeout(function () {
            reDrawGraph();
            i++;
            if(drawStatus==false) {
                reDrawGraph();
                drawStatus=true;
            }
            if(i < graphHeaders.length && playStatus == true) {
                dataIterator(playStatus);
                console.log("Draw: " + playStatus);
            }
        },3500)
    }

    function reDrawGraph () {
        if(graphHeaders[i] != xHeader && playStatus == true) {
            scatterPlot(countryStats,xHeader,graphHeaders[i]);
        }
        else drawStatus = false; 
    }

    dataIterator(playStatus);
}

document.getElementById("playButton").onclick = function () {
    if(playStatus == true) {
        playStatus = false;
        clearTimeout(timeoutStatus);
        document.getElementById("playButton").innerHTML = "Play Data"; 
    }
    else if(playStatus == false) {
        playStatus = true;
        clearTimeout(timeoutStatus);
        document.getElementById("playButton").innerHTML = "Stop Data";
    }

    playData();

    document.getElementById("playButton").innerHTML;
}

function updateGraph(objects, xKey, yKey) {
    playStatus = false;
    clearTimeout(timeoutStatus);
    scatterPlot(objects, xKey, yKey);
}

