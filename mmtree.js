var width = 1000,
    height = 1000;

var force = d3.layout.force()
    .size([width, height])
    .charge(-1000)
    .linkDistance(50)
    .on("tick", tick);

var size = d3.scale.pow().exponent(1)
  .domain([1,100])
  .range([8,24]);

var drag = force.drag()
    .on("dragstart", dragstart);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

var graph;

var fileaddress = "http://localhost:8000/Desktop/mm2test/";
var filename = "template";
var filetype = ".json";
var MAX_NODES = 10;

d3.json(fileaddress + filename + filetype, function(error, json)
{
  if(error) return console.warn(error);
    graph = json;

    var section = [];
    var nvisual = [];
    for(var i = 0; i < MAX_NODES; i++)
      {
        var n = graph["section_"+i];

        if(n)  
        {
          n.index = i;
          section.push(n);
          
          nvisual.push(visualisesection(n, i));
        }
      }
      console.log("Sections found: " + section.length);

  var lvisual = [];

  for(var i = 0; i < section.length; i++)
  {
    var targ = section[i];
    var turntos = [];
    Object.keys(targ).forEach(function(k)
    {
      if(targ[k].type == "turnto") turntos.push(k);
    });

    console.log("Section " + section[i].index + " -- Turn-Tos found: " + turntos.length);

    for(var l = 0; l < turntos.length; l++)
    {
      var id = targ[turntos[l]].value.sectionID;
      if(id < section.length &&  id > 0)
      {
        var link = targ[turntos[l]];
        lvisual.push(visualiselink(targ, link));
      }
    }
  }
    var links = [
    {"source":0, "target":1},
    {"source":1, "target":2}
  ];
  console.log("Links generated: " + lvisual.length);
  for(var i = 0; i < links.length; i++) console.log(JSON.stringify(links[i]));

   force.nodes(nvisual)
        .links(links)
        .start();

   link =     svg.selectAll(".link").data(link)
              .enter()
              .append("line")
              .attr("class", "link")
              .attr("stroke", "#000");

   node = node.data(nvisual)
              .enter().append("circle")
              .attr("class", "node")
              .attr("r", function(d){return d.size;})
              .attr("fill", function(d) {return d.fill;})
              .on("dblclick", dblclick)
              .on("mouseover", hover)
              .call(drag);
});


function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

function dblclick(d) {
  d3.select(this).classed("fixed", d.fixed = false);
}

function hover(d)
{
  d3.select(this).classed("hover");
}

function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}

function visualisesection(section, i)
{
  var vis = {};
  vis.fill = section.fill || "#FF0";
  vis.x = section.posx || 20 * i;
  vis.y = section.posy || 20 * i;
  vis.size = section.size || 20;
  vis.weight = section.weight || 1;
  return vis;
}

function visualiselink(node, link)
{
  var vis = {};
  vis.source = 0;//parseInt(node.index)-1 || 0;
  vis.target = 1;//parseInt(link.value.sectionID)-1 || 1;
  vis.fill = link.fill || "#FFF";
  return vis;
}

function saveData()
{
  console.log("saving!");
  var fin = generateData();

  var a = document.createElement("a");
  var file = new Blob([JSON.stringify(fin, null, 2)], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
}

function generateData()
{
  var fin = JSON.parse(JSON.stringify(graph));
  console.log("found " + fin.nodes.length + " nodes");
  var n;
  for(n in fin.nodes)
  {
    delete fin.nodes[n].index;
    delete fin.nodes[n].weight;
    delete fin.nodes[n].px;    
  }
  return fin;
}






