// define margin and dimensions for svg
const w = 900;
const h = 600;
const margin = 40;

// create svg
var svg = d3.select("#substance-use-disorder")
            .append('svg')
            .attr('width', w)
            .attr('height', h);

// create color scheme
var colorScheme = d3.schemeReds[4];
colorScheme.unshift("#eee");

// define projection and path required for Choropleth
var path = d3.geoPath();
var projection = d3.geoNaturalEarth()
                    .scale(w/2 / Math.PI)
                    .translate([w/2, h/2])
var path = d3.geoPath()
                .projection(projection);

// load the topo data and drug data
Promise.all([d3.json("world_countries.json"), d3.csv("prevalence_of_substance_use_disorders.csv")])
        .then(function(v) {
            world =v[0];
            data = v[1];
            try {
            ready(world, data)
            }
            catch(err) {
            console.log(err)
            }
        });

// run ready function when data is loaded successfully
function ready(world, data) {
    // extract all years
    data = d3.nest()
    .key(function(d) { return d.Year})
    .rollup(function(v) {
        return v.map(function(d) {
            return {
                country: d.Country,
                code: d.Code,
                value: d.Value
            };
        });
    })
    .entries(data);
    // country names
    var countryNames = [];
    data.forEach(function(d) {
    countryNames.push(d.key)
    });

    // append the year options to the dropdown
    // add the options to the button
    d3.select("#selectYear")
    .selectAll('myOptions')
    .data(countryNames)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // event listener for the dropdown. Update choropleth and legend when selection changes. Call createMapAndLegend() with required arguments.
    d3.select("#selectYear")
    .on("change", function(d) {
    // recover the option that has been chosen
    var selectedYear = d3.select(this).property("value");
    // run the updateChart function with this selected option
    createMapAndLegend(world, data, selectedYear);
    })

    // create Choropleth with default option. Call createMapAndLegend() with required arguments.
    var selectedYear = data[26].key
    createMapAndLegend(world, data, selectedYear);

    console.log(data);
};

// this function should create a Choropleth and legend using the world and data arguments for a selectedYear
// also use this function to update Choropleth and legend when a different year is selected from the dropdown
function createMapAndLegend(world, data, selectedYear){ 
    // extract the selected year data object from data
    for (let i = 0; i < data.length; i++) {
    if (data[i].key == selectedYear) {
        var selectedYearData = {};
        var tooltipCountry = {}; // show country data in tooltip
        data[i].value.forEach(function(item) {
            var key = item.country;
            selectedYearData[key] = parseFloat(item.value);  //assign the key and value to output obj
            tooltipCountry[key] = {
                year: data[i].key,
                value: item.value,
            };
        });
    }
    };

    // define tooltip
    var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, -10])
            .html(function(d) {
                if (tooltipCountry[d.properties.name]) {    // if country data is available
                    return "Country: <span style='color:white'><strong>" + d.properties.name + "</strong></span>" + 
                "<p><\p>Year:<span style='color:white'><strong>" + tooltipCountry[d.properties.name].year + "</strong></span>" + 
                "<p><\p>Population with substance use disorder: <span style='color:white'><strong>" + tooltipCountry[d.properties.name].value + "% </strong></span>";
                }
            });
    svg.call(tip);

    // create color scale
    var colorScale = d3.scaleThreshold()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
    .range(d3.schemeBlues[8]);

    // draw the map
    svg.append("g")
    .attr("class", "countries")
    .selectAll("path")
    .data(world.features)
    .enter()
    .append("path")
    .attr("fill", function (d){
        // Pull data for this country
        d.value = selectedYearData[d.properties.name] || 0;
        // Set the color
        return colorScale(d.value);
    })
    .attr("d", path)
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)



    // add legend
    var g = svg.append("g")
            .attr("class", "legendThreshold")
            .attr("transform", "translate(20,100)");
    g.append("text")
    .attr("class", "label")
    .attr("x", 0)
    .attr("y", -margin/2)
    .text("Population with substance use disorder:");

    // labels for legends
    var labels = ["no data", "0%","1%", "2%", "4%", "5%", "6%", "7%"];

    var legend = d3.legendColor()
    .labels(function (data) { return labels[data.i]; })
    .shapePadding(8)
    .scale(colorScale);
    svg.select(".legendThreshold")
    .call(legend);
    
    let caption = svg.append('text')
    .attr('class', 'caption')
    .attr('x', w)
    .attr('y', h-margin)
    .style('text-anchor', 'end')
    .html('Source: Institute for Health Metrics and Evaluation (IHME)');
};

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
        var yPosition = parseFloat(d3.select(this).attr("y"))+ h + margin + 220; // yPosition needs to be fixed
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