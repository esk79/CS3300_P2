var scatterHeight = 400;
var scatterWidth = 600;
var scatterPadding = 75;
var allPoints = []
var selectedPoints = [];

var testData = [["Point 1",1,1,1],["Point 2",2,2,2],["Point 3",3,3,5],["Point 4",4,5,20],["Point 5",5,3,4],
    ["Point 6",10,2,29],["Point 7",8,10,3],["Point 8",3,7,5],["Point 9",1,10,13],["Point 10",13,10,15]]

function scatterPlot (objects, xKey, yKey) {
    if(d3.select("#graph>svg").length > 0) {
    	d3.select("#graph>svg").remove();
    }

    var svg = d3.select("#graph").append("svg")
      .attr("height", scatterHeight).attr("width", scatterWidth);

    var xMax = 0;
    var xMin = 0;
    var yMax = 0;
    var yMin = 0;

    //max and min x and y values
    objects.forEach(function (data) {
    	var xValue = data[xKey];
    	var yValue = data[yKey];

    	if (xValue > xMax) {
    		xMax = xValue*1.05;
    	}
    	// if (xValue < xMin) {
    	// 	xMin = xValue;
    	// }
    	if (yValue > yMax) {
    		yMax = yValue*1.05;
    	}
    	// if (yValue < yMax) {
    	// 	yMin = yValue;
    	// }
    })

    //set up scales
    xScale = d3.scale.linear().domain([0,xMax]).range([scatterPadding, scatterWidth - scatterPadding]);
    yScale = d3.scale.linear().domain([0,yMax]).range([scatterHeight - scatterPadding,scatterPadding]);

    //add axis
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
    svg.append("g").attr("class", "axis").attr("transform", "translate(0," + yScale(0) + ")").call(xAxis);

    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
    svg.append("g").attr("class", "axis").attr("transform", "translate(" + xScale(0) + ",0)").call(yAxis);

    //add graph and axis titles
    svg.append("text").attr("x",scatterWidth/3).attr("y",25).attr("class","axisTitle").
    text("Graph of " + yKey + " vs " + xKey);
    svg.append("text").attr("x",scatterWidth/3).attr("fill","#cccc").attr("y",scatterHeight-10)
      .attr("class","axisTitle").text(xKey);
    svg.append("text").attr("x",10).attr("fill","#cccc").attr("y",scatterHeight/2-20)
      .attr("class","axisTitle").text(yKey);

    objects.forEach(function (data) {
     	var pointName = data[0];
     	var xValue = data[xKey];
     	var yValue = data[yKey];
        var pointID = pointName.replace(" ","");
        
        svg.append("circle")
            .attr("cx",xScale(xValue))
            .attr("cy",yScale(yValue))
            .attr("r",5)
            .attr("class", "graphPoint")
            .attr("id",  pointID);

        svg.append("text")
            .attr("x",xScale(xValue-xMax*.05))
            .attr("y",yScale(yValue+yMax*.05))
            .attr("class", "pointLabel")
            .attr("id", "label" + pointID)
            .text(pointName);
    });

    allPoints = d3.selectAll(".graphPoint");
}

scatterPlot(testData,1,2)

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
        // else {
        //     var removePoint = selectedPoints[0];
        //     replaceClassById(removePoint, "selectedPoint","graphPoint");
        //     replaceClassById("label"+removePoint,"selectedLabel","pointLabel");
        //     selectedPoints.splice(0,1);
        //     replaceClassById(this.id, "graphPoint","selectedPoint");
        //     replaceClassById("label"+this.id,"pointLabel","selectedLabel");
        //     selectedPoints.push(this.id);
        // }
    }

    // console.log(this);
});

function replaceClassById (id, oldClass, newClass) {
    d3.select("#" + id).classed(newClass, true)
    d3.select("#" + id).classed(oldClass, false)
}


