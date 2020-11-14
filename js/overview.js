// enter code to define margin and dimensions for svg
const margin = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 30
    },

width = 700 - margin.left - margin.right,
//height = window.innerHeight - margin.top - margin.bottom;
height = 400

var playButton = d3.select("#play-button");
var moving = false;
var targetValue = 600;
var currentValue = 0;

var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%m/%d/%y");

var startDate = new Date("1996-01-01"),
    endDate = new Date("2020-12-01");

// var svg0 = d3.select("#vis")
//     .append("svg")
//     .attr("width", 1000)
//     .attr("height", 150);
    
// enter code to create svg
const svg = d3.select("#choropleth").append("svg")
    .attr("width", width)
    .attr("height", height);

// enter code to create svg for legends    
const svg2 = d3.select("#lengends").append("svg")
    .attr("width", 700)
    .attr("height", 150);      

var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, targetValue])
    .clamp(true);

var slider = svg2.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + height/4 + ")");

slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() {
            currentValue = d3.event.x;
            update(x.invert(currentValue)); 
        })
    );

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(10))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoYear(d); });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-18) + ")")
    
// enter code to create color scale
//const color = d3.scaleQuantile().range(["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"]);

// enter code to define tooltip
const tip = d3.tip().attr("class", "d3-tip")
    .direction("e")
    .html(d => `<strong>State: </strong> <span class='details'>${d["properties"]["name"]}<br>
    <strong>Marijuana Status: </strong> <span class='details'>${d["properties"]["status"]}</span><br>
    <strong>Year: </strong> <span class='details'>${d["properties"]["selectedYear"]}<br>`);

// enter code to define projection and path required for Choropleth
const projection = d3.geoAlbersUsa()
                    .scale([600])
                    .translate([width /2  , height /2]) 
                    // translate to center of screen

var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
                .projection(projection);

// define any other global variables
const dropdown = document.getElementById("countries");

Promise.all([d3.json("data/us_states.json"), d3.csv("data/us_states_marijuana.csv")]).then(function(data) {
    us = data[0];
    mjData = data[1];
    //console.log("world", world)
    //console.log("rating", gameData)
    try {
        ready(null, us, mjData)
    }
    catch(err) {
        console.log(err)
    }
})

function ready(error, us, mjData) {

    // enter code to extract all unique games from gameData
    uniqueNames = Object.keys(mjData).sort();
    //globalGameData = mjData;
    //console.log("unique", mjData)
    // enter code to append the game options to the dropdown
    uniqueNames.forEach(value => {
        const option = document.createElement("option");
        option.text = value;
        option.value = value;
        dropdown.add(option);
    });

    // event listener for the dropdown. Update choropleth and legend when selection changes. Call createMapAndLegend() with required arguments.
    // dropdown.addEventListener("change", value => {
    //     createMapAndLegend(us, mjData, mjData[dropdown.options[dropdown.selectedIndex]
    //         .value]);
    // });
    // create Choropleth with default option. Call createMapAndLegend() with required arguments.
    //projection.fitSize([width, height], us);
    //path.projection(projection);

    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .attr('class', 'states')
        .data(us.features)
        .enter()
        .append("path")
        .attr("d", path)
        .call(tip);

    // svg.append("g")
    //     .attr("class", "legendQuant")
    //     .attr("transform", `translate(${width + margin.left - 200},50)`)
    //     .style("font-size", "20px");

        var rec1 = svg2.append("rect")
                    .attr("x", 0)
                    .attr("y", 10)
                    .style("fill", function(d){ return "#deebf7"})
                    .attr("id", "prev")
                    .attr("width", 15)
                    .attr("height", 15);
        var rec2 = svg2.append("rect")
                    .attr("x", 0)
                    .attr("y", 30)
                    .style("fill", function(d){ return "#9ecae1"})
                    .attr("id", "prev")
                    .attr("width", 15)
                    .attr("height", 15);
        var rec3 = svg2.append("rect")
                    .attr("x",0)
                    .attr("y", 50)
                    .style("fill", function(d){ return "#3182bd"})
                    .attr("width", 15)
                    .attr("height", 15);

        var text1 = svg2.append("text")
                    .attr("dx", 20)
                    .attr("dy", 23)
                    .attr("id", "prev")
                    .text("No laws legalizing marijuana")
        var text2 = svg2.append("text")
                    .attr("dx", 20)
                    .attr("dy", 43)
                    .attr("id", "prev")
                    .text("Medical marijuana legalized")
        var text3 = svg2.append("text")
                    .attr("dx", 20)
                    .attr("dy", 63)
                    .attr("id", "prev")
                    .text("Marijuana legalized for recreational use")

    playButton
        .on("click", function() {
        var button = d3.select(this);
        if (button.text() == "Pause") {
        moving = false;
        clearInterval(timer);
        // timer = 0;
        button.text("Play");
        } else {
        moving = true;
        timer = setInterval(step, 100);
        button.text("Pause");
        }
        //console.log("Slider moving: " + moving);
        //console.log("click")
    })
                
    // onchange = function() {
    //     var $ = function(id) { return document.getElementById(id); };
    //     $('mySlider').oninput = function() {
    //         console.log("onload", this.value)
    //         createMapAndLegend(us, mjData, this.value)
    //         $('range').innerHTML = `Year: ${this.value}`; };
    //     $('mySlider').oninput();
    // };

    createMapAndLegend(us, mjData, "1996");
}

function step() {
    update(x.invert(currentValue));
    currentValue = currentValue + (targetValue/151);
    if (currentValue > targetValue) {
        moving = false;
        currentValue = 0;
        clearInterval(timer);
        timer = 0;
        playButton.text("Play");
        //console.log("Slider moving: " + moving);
    }
    //console.log("step")
    }

    function update(h) {
    // update position and text of label according to slider scale
    handle.attr("cx", x(h));
    label
        .attr("x", x(h))
        .text(formatDate(h));
    
    console.log("hhhh", h.getYear() + 1900)   
    var year = h.getYear() + 1900
    createMapAndLegend(us, mjData, year) 
    }

// this function should create a Choropleth and legend using the us and marijuana data 
function createMapAndLegend(us, mjData, selectedYear) {
    // console.log("create figure")
    // console.log(mjData)
    // console.log("year", selectedYear)

    // d3.select("#mySlider").on("change", function(d){
    //     selectedValue = this.value
    //     console.log("barvalue", selectedValue)
    // })
    var dataPlot = []
    var selectedYear = selectedYear
    //updateMap(us, mjData, selectedYear)
    for (var i = 0; i < mjData.length; i++) {
        //console.log(data[i])
        var item = mjData[i]
        var year = item["Year"]
        //console.log(year)
        if (year == selectedYear) {
            dataPlot.push(item)
        }
    }
    //console.log("dataPlot", dataPlot)

    for (var i = 0; i < dataPlot.length; i++) {

        var item = dataPlot[i]
        //console.log(item["Medical marijuana legalized"])
        var state = item["State"]
        var medical = item["Medical marijuana legalized"]
        var recre = item["Marijuana legalized for recreational use"]
        var illegal  = item["No laws legalizing marijuana"]
        if (recre == "Yes") {
            dataValue = 2
        } else if (medical == "Yes") {
            dataValue = 1
        } else if (illegal == "Yes") {
            dataValue = 0
        }

    // Grab State Name
    var dataState = state
    // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < us.features.length; j++) {
                var jsonState = us.features[j].properties.name;
                if (dataState == jsonState) {
                    us.features[j].properties.value = dataValue;
                    us.features[j].properties.selectedYear = selectedYear;
                            if (recre == "Yes") {
                                us.features[j].properties.status = "Marijuana legalized for recreational use"
                            } else if (medical == "Yes") {
                                us.features[j].properties.status = "Medical marijuana legalized"
                            } else {
                                us.features[j].properties.status = "No laws legalizing marijuana"
                            }
                // Stop looking through the JSON
                break;
                }
            }
        }

    //console.log("ready")
    //console.log("world", us)
    // d3.select("#mySlider").on("change", function(d){
        // selectedValue = this.value
        //updateChart(selectedValue)
        //console.log("selectedVlaue", selectedValue)
    // })
    
    svg.selectAll("path")
        .attr("fill", function(d) {
            //console.log("status", d)
            var status = d["properties"]["status"]
            if (status == "No laws legalizing marijuana") {
                return "#deebf7"
            }
            if (status == "Medical marijuana legalized") {
                return "#9ecae1"
            }
            if (status == "Marijuana legalized for recreational use") {
                return "#3182bd"
            }
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    // const legend = d3.legendColor()
    //     .labelFormat(d3.format(".2f"))
    //     .titleWidth(200)
    //     .scale(color);
}

// Data Viz: Prevalence by substance use disorders
// define margin and dimensions for svg
const dD_w = 700;
const dD_h = 420;
const dD_margin = 28;

// create svg
var dD_svg = d3.select("#dD_svg")
            .append('svg')
            .attr('width', dD_w)
            .attr('height', dD_h);

// define projection and path required for world map
var dD_path = d3.geoPath();
var dD_projection = d3.geoNaturalEarth()
                    .scale(dD_w/2 / Math.PI)
                    .translate([dD_w/2, (dD_h-dD_margin)/2])
var dD_path = d3.geoPath()
                .projection(dD_projection);

// load the topo data and drug data
Promise.all([d3.json("data/world_countries.json"), d3.csv("data/prevalence_of_substance_use_disorders.csv")])
        .then(function(v) {
            dD_world =v[0];
            dD_data = v[1];
            try {
            dD_Ready(dD_world, dD_data)
            }
            catch(err) {
            console.log(err)
            }
        });

// run ready function when data is loaded successfully
function dD_Ready(world, data) {
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
    var dD_countryNames = [];
    data.forEach(function(d) {
        dD_countryNames.push(d.key)
    });

    // append the year options to the dropdown
    // add the options to the button
    d3.select("#dD_selectYear")
        .selectAll('myOptions')
        .data(dD_countryNames)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // event listener for the dropdown. Update choropleth and legend when selection changes. Call createMapAndLegend() with required arguments.
    d3.select("#dD_selectYear")
        .on("change", function(d) {
        // recover the option that has been chosen
        var dD_selectedYear = d3.select(this).property("value");
        // run the updateChart function with this selected option
        dD_createMapAndLegend(world, data, dD_selectedYear);
        })

    // create Choropleth with default option. Call createMapAndLegend() with required arguments.
    var dD_selectedYear = data[26].key
    dD_createMapAndLegend(world, data, dD_selectedYear);
};

// this function should create a Choropleth and legend using the world and data arguments for a selectedYear
// also use this function to update Choropleth and legend when a different year is selected from the dropdown
function dD_createMapAndLegend(world, data, dD_selectedYear){ 
    // extract the selected year data object from data
    for (let i = 0; i < data.length; i++) {
    if (data[i].key == dD_selectedYear) {
        var dD_selectedYearData = {};
        var dD_tooltipCountry = {}; // show country data in tooltip
        data[i].value.forEach(function(item) {
            var key = item.country;
            dD_selectedYearData[key] = parseFloat(item.value);  //assign the key and value to output obj
            dD_tooltipCountry[key] = {
                year: data[i].key,
                value: item.value,
            };
        });
    }
    };

    // define tooltip
    var dD_tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, -10])
            .html(function(d) {
                if (dD_tooltipCountry[d.properties.name]) {    // if country data is available
                    return "Country: <span style='color:white'><strong>" + d.properties.name + "</strong></span>" + 
                "<p><\p>Year:<span style='color:white'><strong>" + dD_tooltipCountry[d.properties.name].year + "</strong></span>" + 
                "<p><\p>Population with substance use disorder: <span style='color:white'><strong>" + dD_tooltipCountry[d.properties.name].value + "% </strong></span>";
                }
            });
    dD_svg.call(dD_tip);

    // create color scale
    var dD_colorScale = d3.scaleThreshold()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8])
        .range(d3.schemeBlues[8]);

    // draw the map
    dD_svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("fill", function (d){
            // Pull data for this country
            d.value = dD_selectedYearData[d.properties.name] || 0;
            // Set the color
            return dD_colorScale(d.value);
        })
        .attr("d", dD_path)
        .on('mouseover', dD_tip.show)
        .on('mouseout', dD_tip.hide)



    // add legend
    var dD_g = dD_svg.append("g")
            .attr("class", "legendThreshold")
            .attr("transform", "translate(20,50)");

    dD_g.append("text")
        .attr("class", "label")
        .attr("x", 0)
        .attr("y", -dD_margin)
        .text("Population with substance use disorder:");

    // labels for legends
    var dD_labels = ["no data", "0%","1%", "2%", "4%", "5%", "6%", "7%"];
    var dD_legend = d3.legendColor()
        .labels(function (data) { return dD_labels[data.i]; })
        .shapePadding(8)
        .scale(dD_colorScale);
    dD_svg.select(".legendThreshold")
        .call(dD_legend);
        
    dD_svg.append('text')
        .attr('class', 'caption')
        .attr('x', dD_w)
        .attr('y', dD_h-dD_margin)
        .style('text-anchor', 'end')
        .html('Source: Institute for Health Metrics and Evaluation (IHME)');
};

// Data Viz: Prevalence by mental disorders
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
var mD_margin = {top: 30, right: 30, bottom: 50, left: 80},
    mD_w = 700 - mD_margin.left - mD_margin.right,
    mD_h = 400 - mD_margin.top - mD_margin.bottom;

// set up update buttons
var mD_US_Button = d3.select("#mD_US_button");
var mD_world_button = d3.select("#mD_world_button");

// append the mD_svg object to the body of the page
var mD_svg = d3.select("#mD_svg")
    .append("svg")
    .attr("width", mD_w + mD_margin.left + mD_margin.right)
    .attr("height", mD_h + mD_margin.top + mD_margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + mD_margin.left + "," + mD_margin.top + ")");

// X axis
var mD_x = d3.scaleBand()
    .range([0, mD_w])
    .domain(mentalDataUS.map(function(d) { return d.group; }))
    .padding(0.2);
    
mD_svg.append("g")
    .attr("class", "h6")
    .attr("transform", "translate(0," + mD_h + ")")
    .call(d3.axisBottom(mD_x))

// Add Y axis
var mD_y = d3.scaleLinear()
    .domain([0, 7])
    .range([mD_h, 0]);

// Add reversed Y axis
var mD_y_reverse = d3.scaleLinear()
    .domain([0, mD_h])
    .range([7, 0]);

mD_svg.append("g")
    .attr("class", "h6")
    .call(d3.axisLeft(mD_y).ticks(5));
mD_svg.append("text")
    .attr("class","myAxis")
    .attr("transform", "rotate(-90)")
    .attr('x', -mD_h/2)
    .attr('y', -mD_margin.left/2)
    .style("text-anchor", "middle")
    .text("Share of Total Population (%)");

mD_svg.append('text')
    .attr('x', mD_w)
    .attr('y', mD_h+mD_margin.bottom)
    .style('text-anchor', 'end')
    .html('Source: Institute for Health Metrics and Evaluation (IHME)');

// A function that create / update the plot for a given variable:
function mD_update(data) {
    var u = mD_svg.selectAll("rect")
        .data(data);
    u
        .enter()
        .append("rect")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("x", function(d) { return mD_x(d.group); })
        .attr("y", function(d) { return mD_y(d.value); })
        .attr("width", mD_x.bandwidth())
        .attr("height", function(d) { return mD_h - mD_y(d.value); })
        .attr("fill", function(d) {
            let a = d3.max(mD_y.domain()); 
            return d3.interpolateBlues(d.value/a);
        });
        
    // tooltip
    mD_svg.selectAll("rect")
        .on("mouseover", function() {
            var elem = document.getElementById("mD_svg").offsetTop;
            console.log(elem);

            //Get this bar's x/y values, then augment for the tooltip
            var xPosition = parseFloat(d3.select(this).attr("x")) + mD_x.bandwidth()/4;
            var yPosition = parseFloat(d3.select(this).attr("y")) + document.getElementById("mD_svg").offsetTop - mD_margin.top/2;

            //Update the tooltip position and value
            d3.select("#mD_tooltip")
                .style("left", xPosition + "px")     
                .style("top", yPosition + "px")					
                .select("#value")
                .text(d3.format(".2f")(mD_y_reverse(d3.select(this).attr("y"))));
            //Show the tooltip
            d3.select("#mD_tooltip").classed("hidden", false);
        })
        .on("mouseout", function() {
            //Hide the tooltip
            d3.select("#mD_tooltip").classed("hidden", true);
        });
    }

// Initialize the plot with the first dataset
mD_update(mentalDataUS);

// Update when click:
mD_US_Button.on("click", function(){
    mD_update(mentalDataUS);  
});
mD_world_button.on("click", function(){
    mD_update(mentalDataWorld);
});