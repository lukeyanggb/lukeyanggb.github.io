// A nice read: http://bl.ocks.org/palewire/d2906de347a160f38bc0b7ca57721328
// for tooltips: http://bl.ocks.org/Caged/6476579, http://bl.ocks.org/wdickerson/64535aff478e8a9fd9d9facccfef8929

// define margin and dimensions for svg
const w = 900;
const h = 600;
const margin = 40;

// create svg
svg = d3.select('#choropleth')
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

// async topo data
var world = new Promise(function(resolve, reject) {
    resolve(d3.json("world_countries.json"));
});;

// async game rating data
var gameData = new Promise(function(resolve, reject) {
    resolve(d3.csv("ratings-by-country.csv", function(d) {
        return {
            game: d.Game,
            country: d.Country,
            numUsers: d["Number of Users"],
            rating: d["Average Rating"]
        }
    }));
});;

// load the topo data and game data
Promise.all([world, gameData])
        .then(function(v) {return ready(v[0], v[1]);})
        .catch(function(e) {return e});

// run ready function when data is loaded successfully
function ready(world, gameData) {
    // extract all unique games from gameData
    gameData = d3.nest()
        .key(function(d) { return d.game})
        .rollup(function(v) {
            return v.map(function(d) {
                return {
                    country: d.country,
                    rating: d.rating,
                    numUsers: d.numUsers
                };
            });
        })
        .entries(gameData);

    // sort the gameData by game names alphabetically
    gameData = gameData.slice().sort(function(x, y) {
        return d3.ascending(x.key, y.key);
    });

    // game names
    var gameNames = [];
    gameData.forEach(function(d) {
        gameNames.push(d.key)
    });

    // append the game options to the dropdown
    // add the options to the button
    d3.select("#selectGames")
      .selectAll('myOptions')
      .data(gameNames)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // event listener for the dropdown. Update choropleth and legend when selection changes. Call createMapAndLegend() with required arguments.
    d3.select("#selectGames")
        .on("change", function(d) {
        // recover the option that has been chosen
        var selectedGame = d3.select(this).property("value");
        // run the updateChart function with this selected option
        createMapAndLegend(world, gameData, selectedGame);
    })
    
    // create Choropleth with default option. Call createMapAndLegend() with required arguments.
    var selectedGame = gameData[25].key
    createMapAndLegend(world, gameData, selectedGame);
}

// this function should create a Choropleth and legend using the world and gameData arguments for a selectedGame
// also use this function to update Choropleth and legend when a different game is selected from the dropdown
function createMapAndLegend(world, gameData, selectedGame){ 
    // extract the selected game data object from gameData
    for (let i = 0; i < gameData.length; i++) {
        if (gameData[i].key == selectedGame) {
            var selectedGameData = {};
            var tooltipCountry = {}; // show game data in tooltip
            gameData[i].value.forEach(function(item) {
                var key = item.country;
                selectedGameData[key] = parseFloat(item.rating);  //assign the key and value to output obj
                tooltipCountry[key] = {
                    game: gameData[i].key,
                    rating: item.rating,
                    numUsers: item.numUsers
                };
            });
        }
    };
    // define tooltip

    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, -10])
                .html(function(d) {
                    if (tooltipCountry[d.properties.name]) {    // if game data is available for this country
                        return "<strong>Country:</strong> <span style='color:white'>" + d.properties.name + "</span>" + 
                    "<p><\p><strong>Game:</strong> <span style='color:white'>" + tooltipCountry[d.properties.name].game + "</span>" + 
                    "<p><\p><strong>Avg Rating:</strong> <span style='color:white'>" + tooltipCountry[d.properties.name].rating + "</span>" +
                    "<p><\p><strong>Number of Users:</strong> <span style='color:white'>" + tooltipCountry[d.properties.name].numUsers + "</span>";
                    }
                });
    svg.call(tip);


    // sort the ratings
    var vals = Object.values(selectedGameData).sort(function(a, b) {return a - b});
    // create color scale
    var colorScale = d3.scaleQuantile()
        .domain(vals)
        .range(colorScheme);
    // draw the map
    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("fill", function (d){
            // Pull data for this country
            d.rating = selectedGameData[d.properties.name] || 0;
            // Set the color
            return colorScale(d.rating);
        })
        .attr("d", path)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)



    // add legend
    var g = svg.append("g")
                .attr("class", "legendThreshold")
                .attr("transform", "translate(20,100)");
    g.append("text")
        .attr("class", "caption")
        .attr("x", 0)
        .attr("y", -margin/2)
        .text("Game Rating");

    // labels for legends
    var labels = ["no ratings", 
                    d3.quantile(vals, 0).toFixed(2) + " - " + d3.quantile(vals, 0.25).toFixed(2), 
                    d3.quantile(vals, 0.25).toFixed(2) + " - " + d3.quantile(vals, 0.5).toFixed(2),
                    d3.quantile(vals, 0.5).toFixed(2) + " - " + d3.quantile(vals, 0.75).toFixed(2),
                    d3.quantile(vals, 0.75).toFixed(2) + " - " + d3.quantile(vals, 1).toFixed(2)];

    var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(8)
    .scale(colorScale);
    svg.select(".legendThreshold")
    .call(legend);

    // add username
    svg.append("text")
        .attr('x', (w-margin))
        .attr('y',(h-margin))
        .style("text-anchor", "middle")
        .style('fill', '#3182bd')
        .text("ylu635");
};