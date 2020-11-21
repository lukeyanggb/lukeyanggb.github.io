function getPredictionResults() {
  const predictionResultPromise = getPredictionResultsPromise();
  predictionResultPromise.then(value => {
    // TODO: use value to update graph
    // console.log("onClick", result);
    drawCollapsibleTree(value)
  });
}

function getPredictionResultsPromise() {
  const ids = [
    'inputGroupSelectEducation',
    'inputGroupSelectEmployment',
    'inputGroupSelectMarijuana',
    'inputGroupSexualId',
    'inputGroupHealth',
    'inputGroupEduDrugs',
    'inputGroupGrade',
    'inputGroupAttack',
    'inputGroupReligious'
  ];

  const modelTypes = [
    'alcohol',
    'cocever',
    'crkever',
    'herever',
    'impsoc',
    'metha',
    'tobacco',
    'impwork'
  ];

  const input = ids.reduce((prev, id) => {
    prev.push(+document.getElementById(id).value);
    return prev;
  }, []);
  console.log("input", input);
  return new Promise((resolve, reject) => {
    Promise.all(modelTypes.reduce((prev, type) => {
        prev.push(new Promise((resolve, reject) => {
          const url = new URL('https://duovdp3m2c.execute-api.us-east-1.amazonaws.com/Prod/predict');
          url.search = new URLSearchParams({
            type: type,
            input: JSON.stringify(input)
          }).toString();
          fetch(url)
            .then(response => response.ok ? response.json() : Promise.reject(response))
            .then(json => resolve({
              key: type,
              value: +json.output
            }))
            .catch(error => reject(error));
        }));
        return prev;
      }, []))
      .then(values => resolve(values.reduce((prev, curr) => {
        prev[curr.key] = curr.value;
        return prev;
      }, {})))
      .catch(e => reject(e));
  });
}

// example: test run
getPredictionResults();

// draw tree
// Reference: https://blockbuilder.org/tejaser/55c43b4a9febca058363a5e58edbce81
// Thos function is modified based on reference.
function drawCollapsibleTree(value) {
  console.log("value in tree", value)
  
  // clean up
  d3.select("#treeResult").remove()
  d3.select("#mlResultsInTree")
  .append("div")
  .attr("id", "treeResult")

  // Set the dimensions and margins of the diagram
  var margin = {
    top: 20,
    right: 90,
    bottom: 30,
    left: 90
  },
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  var colorScale = d3.scaleLinear()
  .domain([0, 1])
  .range(["#dd1c77", "#2b8cbe"]);
  var widthScale = d3.scaleLinear()
  .domain([1, 80])
  .range([1, 10]);

  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#treeResult").append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("id", "prev")
  .attr("transform", "translate(" +
    margin.left + "," + margin.top + ")");

  var modelsList = []
  var resultsList = []
  for (let k in value) {
    //console.log(k + ' is ' + value[k])
    mapToName = {"alcohol" : "Alcohol use", "cocever" : "Cocaine use", "crkever" : "Crack use","herever" : "Heroin use", "impsoc" : "Difficult to socialize", "tobacco" : "Tobacco use", "metha" : "Methamphetamine use", "impwork" : "Difficult to do daily work"} 
    console.log("k", mapToName[k])
    modelsList.push(mapToName[k])
    if (value[k] == 0) {
      resultsList.push("low probabilty")
    } else {
      resultsList.push("high probabilty")
    }
}

//console.log(modelsList)
//console.log(resultsList)
  var treeData = {
    "name": "Prediciton",
    "value": 75,
    "type": "black",
    "level": "red",
    "customvalue1": 51,
    "customvalue2": 24,
    "children": [{
        "name": "Model_1",
        "value": 40,
        "type": "black",
        "level": "green",
        "customvalue1": 23,
        "customvalue2": 17,
        "children": [{
          "name": "Result_1",
          "value": 20,
          "type": "grey",
          "level": "red",
          "customvalue1": 3,
          "customvalue2": 0,
        }, ]
      },
      {
        "name": "Model_2",
        "value": 40,
        "type": "black",
        "level": "green",
        "customvalue1": 23,
        "customvalue2": 17,
        "children": [{
          "name": "Result_2",
          "value": 20,
          "type": "grey",
          "level": "red",
          "customvalue1": 3,
          "customvalue2": 0,
        }, ]
      },
      {
        "name": "Model_3",
        "value": 40,
        "type": "black",
        "level": "green",
        "customvalue1": 23,
        "customvalue2": 17,
        "children": [{
          "name": "Result_3",
          "value": 20,
          "type": "grey",
          "level": "red",
          "customvalue1": 3,
          "customvalue2": 0,
        }, ]
      },
      {
        "name": "Model_4",
        "value": 40,
        "type": "black",
        "level": "green",
        "customvalue1": 23,
        "customvalue2": 17,
        "children": [{
          "name": "Result_4",
          "value": 20,
          "type": "grey",
          "level": "red",
          "customvalue1": 3,
          "customvalue2": 0,
        }, ]
      },
      {
        "name": "Model_5",
        "value": 40,
        "type": "black",
        "level": "green",
        "customvalue1": 23,
        "customvalue2": 17,
        "children": [{
          "name": "Result_5",
          "value": 20,
          "type": "grey",
          "level": "red",
          "customvalue1": 3,
          "customvalue2": 0,
        }, ]
      },
      {
        "name": "Model_6",
        "value": 40,
        "type": "black",
        "level": "green",
        "customvalue1": 23,
        "customvalue2": 17,
        "children": [{
          "name": "Result_6",
          "value": 20,
          "type": "grey",
          "level": "red",
          "customvalue1": 3,
          "customvalue2": 0,
        }, ]
      },
      {
        "name": "Model_7",
        "value": 40,
        "type": "black",
        "level": "green",
        "customvalue1": 23,
        "customvalue2": 17,
        "children": [{
          "name": "Result_7",
          "value": 20,
          "type": "grey",
          "level": "red",
          "customvalue1": 3,
          "customvalue2": 0,
        }, ]
      },
      {
        "name": "Model_8",
        "value": 40,
        "type": "black",
        "level": "green",
        "customvalue1": 23,
        "customvalue2": 17,
        "children": [{
          "name": "Result_8",
          "value": 20,
          "type": "grey",
          "level": "red",
          "customvalue1": 3,
          "customvalue2": 0,
        }, ]
      }
    ]
  };


  for (let i in treeData.children) {
    var model  = treeData.children[i]
    //console.log("model", model)
    model.name  = modelsList[i]
    for (j in model.children) {
      var result  = model.children[j]
      //console.log("result", result)
      result.name = resultsList[i]
    }
  }


  var i = 0,
    duration = 750,
    root;

  // declares a tree layout and assigns the size
  var treemap = d3.tree().size([height, width]);

  // Assigns parent, children, height, depth
  root = d3.hierarchy(treeData, function (d) {
    return d.children;
  });
  root.x0 = height / 2;
  root.y0 = 0;

  // Collapse after the second level
  root.children.forEach(collapse);

  update(root);

  // Collapse the node and all it's children
  function collapse(d) {
    if (d.children) {
      d._children = d.children
      d._children.forEach(collapse)
      d.children = null
    }
  }

  function update(source) {

    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

    // Compute the new tree layout.
    var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
      d.y = d.depth * 180
    });

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = svg.selectAll('g.node')
      .data(nodes, function (d) {
        return d.id || (d.id = ++i);
      });

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function (d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on('click', click);

    // Add Circle for the nodes
    nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      })
      .style("stroke", function (d) {
        return colorScale(d.data.customvalue2 / (d.data.customvalue2 + d.data.customvalue1))
      });

    // Add labels for the nodes
    nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", function (d) {
        return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function (d) {
        return d.children || d._children ? "end" : "start";
      })
      .text(function (d) {
        return d.data.name;
      })
      .style("fill", function (d) {
        return colorScale(d.data.customvalue2 / (d.data.value))
      });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
      .attr('r', 10)
      .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      })
      .attr('cursor', 'pointer');


    // Remove any exiting nodes
    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
      .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
      .style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    var link = svg.selectAll('path.link')
      .data(links, function (d) {
        return d.id;
      })
      .style('stroke-width', function (d) {
        return widthScale(d.data.value)
      });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function (d) {
        var o = {
          x: source.x0,
          y: source.y0
        }
        return diagonal(o, o)
      })
      .style('stroke-width', function (d) {
        return widthScale(d.data.value)
      });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
      .duration(duration)
      .attr('d', function (d) {
        return diagonal(d, d.parent)
      });

    // Remove any exiting links
    var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function (d) {
        var o = {
          x: source.x,
          y: source.y
        }
        return diagonal(o, o)
      })
      .style('stroke-width', function (d) {
        return widthScale(d.data.value)
      })
      .remove();

    // Store the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {

      path = `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`

      return path
    }

    // Toggle children on click.
    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }
  }
}