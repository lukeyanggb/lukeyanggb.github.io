// Comment: a nice read: http://learnjsdata.com/group_data.html

//Width and height
var w = 900;
var h = 500;
var h2 = 400;
var padding = 40;

var dataset, xScale, yScale, line;  //Empty, for now
// For converting Dates to strings
var formatTime = d3.timeFormat("%Y");
// Color scheme
var color = d3.scaleOrdinal().range(d3.schemeCategory10);
// Wanted years: 2015-2019
var years = [2015, 2016, 2017, 2018, 2019];
// Avaliable ratings:
var ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Load in data
d3.dsv(",", "average-rating.csv", function(d){
  return {
    name: d.name,
    year: parseInt(d.year),  // Make a new Date object
    average_rating: Math.floor(d.average_rating),  // Convert from string to float
    users_rated: parseInt(d.users_rated)
  };
}).then(function(data){
  
  var dataset = data;
  
  // Count ratings by year
  var ratingsCount = d3.nest()
    .key(function(d) { return d.year})
    .key(function(d) { return d.average_rating; })
    .rollup(function(v) { return v.length; })
    .entries(dataset)
    .map(function(group) {
      return {
        year: parseInt(group.key),
        values: group.values.map(function (val) {
          return {
            rating: parseInt(val.key),
            count: val.value
          };
        })
      }
    })
    .map(function(group) {  // assign count = 0 to the rating if that year has zero game with that rating.
      for (let i = 0; i < ratings.length; i++) {
        var found = false;
        for (let j = 0; j < group.values.length; j++) {
          if (ratings[i] == group.values[j].rating) {
            found = true;
          }
        }
        if (!found) { // if did't find that rating
          group.values.push({rating: ratings[i], count: 0})
        }
      };
      return group;
    });
  console.log(dataset);

  // Toprated games (up to 5) based on year and rating
  var topRatedGames = d3.nest()
    .key(function(d) { return d.year; })
    .key(function(d) { return d.average_rating; })
    .rollup(function(v) {
      return v.slice().sort(function(a, b) {
        return d3.descending(a.users_rated, b.users_rated);  // sort the object array by rating value
      }).slice(0,5);  // only include up to five games
    })
    .entries(dataset)
    .map(function(group) {
      return {
        year: parseInt(group.key),
        values: group.values.map(function (val) {
          return {
            rating: parseInt(val.key),
            topGames: val.value
          };
        })
      }
    })
    .map(function(group) {  // assign count = 0 to the rating if that year has no game with that rating.
      for (let i = 0; i < ratings.length; i++) {
        var found = false;
        for (let j = 0; j < group.values.length; j++) {
          if (ratings[i] == group.values[j].rating) {
            found = true;
          }
        }
        if (!found) { // if did't find that rating, assign null
          group.values.push({rating: ratings[i], topGames: null})
        }
      };
      return group;
    });
  console.log(topRatedGames);
  
  // check results
  // console.table(ratingsCount);
  // console.log(JSON.stringify(ratingsCount[0]));
  
  // Create scale functions
  xScaleLineChart = d3.scaleLinear()
           .domain([
              d3.min(ratingsCount, function(d) {
               return d3.min(d.values, function(v) { return v.rating});
              }), 
              d3.max(ratingsCount, function(d){
                return d3.max(d.values, function(v) { return v.rating});
              })])
           .range([2*padding, w-padding]);

  yScaleLineChart = d3.scaleLinear()
          .domain([0, d3.max(ratingsCount, function(d) {
            return d3.max(d.values, function(v) { return v.count;});
          })])
          .range([h-2*padding, 2*padding]);

  // Define axes
  xAxis = d3.axisBottom()
    .scale(xScaleLineChart)
    .ticks(10);
  yAxis = d3.axisLeft()
    .scale(yScaleLineChart)
    .ticks(10);

  // Define line generator
  line = d3.line()
        .x(function(d) { return xScaleLineChart(d.rating); })
        .y(function(d) { return yScaleLineChart(d.count); });
  
  // Create SVG element
  var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

  // Create lines
  for (let index = 0; index < ratingsCount.length; index++) {
    if (years.includes(ratingsCount[index].year)) {
      // Create line for each year
      svg.append("path")
      .datum(ratingsCount[index].values.slice().sort(function(x, y) {
        return d3.ascending(x.rating, y.rating);  // sort the object array by rating value
      }))
      .attr("class", "line")
      .attr("d", line)
      .style("stroke", color(index));
    }
  }

  //Create axes
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0, " + (h - 2*padding) + ")")
    .call(xAxis);
  svg.append("text")
    .attr("class","axisLabel")
    .attr("transform",
          "translate(" + (w/2) + " ," +
          (h-padding) + ")")
    .style("text-anchor", "middle")
    .text("Rating");

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + 2*padding + ",0)")
    .call(yAxis);
  svg.append("text")
    .attr("class","axisLabel")
    .attr("transform", "rotate(-90)")
    .attr('x', -h/2)
    .attr('y', padding)
    .style("text-anchor", "middle")
    .text("Count");

    // create a circle array
    var circleData = [];
    for (let i = 0; i < ratingsCount.length; i++) {
      if (years.includes(ratingsCount[i].year)) {
        // Create line for each year
         for (let j = 0; j < ratingsCount[i].values.length; j++) {
           circleData.push({
              colorIndex: i,
              year: ratingsCount[i].year,
              rating: ratingsCount[i].values[j].rating,
              count: ratingsCount[i].values[j].count,
           });
         };
      };
    };

    console.log(topRatedGames);
    // add circles
    svg.selectAll("circle")
      .data(circleData)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return xScaleLineChart(d.rating);})
      .attr("cy", function(d) { return yScaleLineChart(d.count);})
      .attr("r", 5)
      .style("fill", function(d) {return color(d.colorIndex)})
      // add interactive barcharts here
      .on("mouseover", function(d){
        // larger size of the hovered circle
        d3.select(this)
          .attr('r', 10);
        // save the color index
        console.log(d);
        var colorBar = d.colorIndex;
        // get the dataset
        for (let i = 0; i < topRatedGames.length; i++) {
          if (topRatedGames[i].year == d.year) {
            for (let j = 0; j < topRatedGames[i].values.length; j++) {
              if (topRatedGames[i].values[j].rating == d.rating) {
                var datasubset = topRatedGames[i].values[j].topGames;
              };
            };
          };
        };
        if (datasubset != null) {
          // check the dataset
          datasubset = datasubset.reverse();
          console.log(datasubset);
          // create a bar chart
          // set the scale function
          yScaleBarChart = 
            d3.scaleBand()
              .domain(datasubset.map(function(d) {
                return d.name.slice(0, 10);
              }))
              .range([h2-2*padding, padding])
              .padding(0.2);

          xScaleBarChart = 
            d3.scaleLinear()
              .domain([0, d3.max(datasubset, function(d) {
                return d.users_rated;
              })])                  
              .range([3*padding, w-padding]);
          console.log(xScaleBarChart.range());
          // create svg element
          svg2 = d3.select("body")
                    .append("svg")
                    .attr("class", "hover")
                    .attr("width", w)
                    .attr("height", h2);

          // append the rectangles for the bar chart
          svg2.selectAll(".bar")
              .data(datasubset)
              .enter()
              .append("rect")
              .attr("class", "bar")
              .attr("width", function(d) { return xScaleBarChart(d.users_rated)-3*padding; } )
              .attr("y", function(d) { 
                return Math.floor(yScaleBarChart(d.name.slice(0, 10))+yScaleBarChart.bandwidth()/2-padding/2); 
              })
              .attr('x', 3*padding)
              .attr("height", padding)
              .style("fill", color(colorBar));

          // add the x Axis
          svg2.append("g")
              .attr("transform", "translate(0," + (h2-2*padding) + ")")
              .call(d3.axisBottom(xScaleBarChart));
          svg2.append("text")
              .attr("class","axisLabel")
              .attr("transform",
                    "translate(" + (w/2+padding/2) + " ," +
                    (h2-padding) + ")")
              .style("text-anchor", "middle")
              .text("Number of users");
          // add the X gridlines
          svg2.append("g")			
              .attr("class", "grid")
              .attr("transform", "translate(0," + (h2-2*padding) + ")")
              .call(d3.axisBottom(xScaleBarChart)
                      .tickSize((3*padding-h2))
                      .tickFormat(""));

          // add the y Axis
          svg2.append("g")
              .attr('transform', 'translate(' + 3*padding + ", 0)")
              .call(d3.axisLeft(yScaleBarChart));
          svg2.append("text")
              .attr("class","axisLabel")
              .attr("transform", "rotate(-90)")
              .attr('x', (-h2/2+padding/2))
              .attr('y', padding)
              .style("text-anchor", "middle")
              .text("Games");
          
          // create a title
          svg2.append("text")
          .attr("class","title")
          .attr('x', (w/2+padding/2))
          .attr('y', padding/2)
          .style("text-anchor", "middle")
          .text("Top 5 most rated games for year " + datasubset[0].year + " with rating " + datasubset[0].average_rating);
        }
        })
      .on("mouseout", function(){
        // return to normal circle size
        d3.select(this)
          .attr('r', 5);
        // remove the bar chart
        d3.selectAll('.hover').remove();
      });

    // add legend
    for (let i = 0; i < circleData.length/ratings.length; i++) {
      svg.append('circle')
        .attr('cx', w-2*padding)
        .attr('cy', 2*padding+(i/2)*padding)
        .attr('r', 5)
        .style('fill', color(circleData[i*ratings.length].colorIndex));
      
      svg.append('text')
        .attr('class', 'seriesLabel')
        .attr('x', Math.floor(w-1.3*padding))
        .attr('y', 2*padding+(i/2)*padding)
        .attr('dy', '0.3em')
        .text(circleData[i*ratings.length].year)
    }
    
    // create a title
    svg.append("text")
    .attr("class","title")
    .attr('x', w/2)
    .attr('y', padding)
    .style("text-anchor", "middle")
    .text("Board games by Ratings 2015-2019");

    // add username
    svg.append("text")
    .attr('x', w/2)
    .attr('y', Math.floor(1.6*padding))
    .style("text-anchor", "middle")
    .style('fill', 'crimson')
    .text("ylu635");

});