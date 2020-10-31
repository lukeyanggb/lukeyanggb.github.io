// create 2 data_set
var mentalDataUS = [
    {group: "Anxiety disorders", value: 6.64},
    {group: "Depression", value: 4.84},
    {group: "Bipolar disorder", value: 0.65},
    {group: "Schizophrenia", value: 0.51},
    {group: "Eating disorders", value: 0.33}
];
    
var mentalDataWorld = [
    {group: "Anxiety disorders", value: 3.76},
    {group: "Depression", value: 3.44},
    {group: "Bipolar disorder", value: 0.6},
    {group: "Schizophrenia", value: 0.25},
    {group: "Eating disorders", value: 0.21}
];
    
// set the dimensions and margins of the graph
var margin2 = {top: 60, right: 30, bottom: 70, left: 100},
    width2 = 900 - margin2.left - margin2.right,
    height2 = 600 - margin2.top - margin2.bottom;

// append the svg2 object to the body of the page
var svg2 = d3.select("#mental_health")
    .append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin2.left + "," + margin2.top + ")");

// X axis
var x = d3.scaleBand()
    .range([0, width2 ])
    .domain(mentalDataUS.map(function(d) { return d.group; }))
    .padding(0.2);
    
svg2.append("g")
    .attr("class", "myXaxis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(d3.axisBottom(x))

// Add Y axis
var y = d3.scaleLinear()
    .domain([0, 7])
    .range([height2, 0]);

// Add reversed Y axis
var y_reverse = d3.scaleLinear()
    .domain([0, height2])
    .range([7, 0]);

svg2.append("g")
    .attr("class", "myYaxis")
    .call(d3.axisLeft(y).ticks(5));
svg2.append("text")
    .attr("class","myYaxis")
    .attr("transform", "rotate(-90)")
    .attr('x', -height2/2)
    .attr('y', -margin2.left/2)
    .style("text-anchor", "middle")
    .text("Share of Total Population (%)");

var caption = svg2.append('text')
      .attr('class', 'caption')
      .attr('x', width2)
      .attr('y', height2+margin2.bottom)
      .style('text-anchor', 'end')
      .html('Source: Institute for Health Metrics and Evaluation (IHME)');



// A function that create / update the plot for a given variable:
function update(data) {

    var u = svg2.selectAll("rect")
        .data(data);

    u
        .enter()
        .append("rect")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("x", function(d) { return x(d.group); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height2 - y(d.value); })
        .attr("fill", function(d) {
            let a = d3.max(y.domain()); 
            return d3.interpolateBlues(d.value/a);
        });
    
    // tooltip
    svg2.selectAll("rect")
        .on("mouseover", function() {
        //Get this bar's x/y values, then augment for the tooltip
        var xPosition = parseFloat(d3.select(this).attr("x")) + x.bandwidth()/4;
        var yPosition = parseFloat(d3.select(this).attr("y"))+100;
        //Update the tooltip position and value
        d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")						
            .select("#value")
            .text(d3.format(".2f")(y_reverse(d3.select(this).attr("y"))));
        //Show the tooltip
        d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function() {
        //Hide the tooltip
        d3.select("#tooltip").classed("hidden", true);
        });
    }

// Initialize the plot with the first dataset
update(mentalDataUS);