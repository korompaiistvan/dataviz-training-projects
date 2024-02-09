// @ts-check
// @ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//bar chart
function mapRecord(record) {
  return {
    composer: record.composer,
    //year: +record.year,
    concerts: +record.concerts,
  };
}

const data_bar = await d3.csv("./assets/NYP_piano_top5.csv", mapRecord);

var margin = { top: 20, right: 250, bottom: 40, left: 90 },
  width = 600 - margin.left - margin.right,
  height = 230 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#barchart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
var x = d3.scaleLinear().domain([-20, 1000]).range([0, width]);
svg
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  // .call(d3.axisBottom(x))
  .selectAll("text");
//.attr("transform", "translate(-10,0)rotate(-45)")
//.style("text-anchor", "end");

// Y axis
var y = d3
  .scaleBand()
  .range([0, height])
  .domain(
    data_bar.map(function (d) {
      return d.composer;
    })
  )
  .padding(0.6);
svg
  .append("g")
  .call(d3.axisLeft(y).tickSize(0))
  .call((g) => g.select(".domain").remove());

//tooltip
const tooltipBar = d3
  .select("#barchart")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("position", "absolute")
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border-radius", "5px")
  .style("padding", "10px")
  .style("color", "black");

//show tooltip
const showTooltipBar = function (event, a) {
  tooltipBar.style("opacity", 0.9);
  tooltipBar.style("display", "block");
};

//move tooltip
const moveTooltipBar = function (event, a) {
  tooltipBar
    .html(
      a.concerts + " concerts <br> with piano concertos <br> of " + a.composer
    )
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY + 5 + "px")
    //  .style("left", event.concerts + 10 + "px")
    //  .style("top", event.composer + 5 + "px")

    .style("text-align", "left")
    .style("font-weight", "300");
};

//hide tooltip
const hideTooltipBar = function (eventBar, a) {
  tooltipBar.style("display", "none");
};

//Bars
svg
  .selectAll("myRect")
  .data(data_bar)
  .enter()
  .append("rect")
  .attr("x", x(0))
  .attr("y", function (d) {
    return y(d.composer);
  })
  .attr("width", function (d) {
    return x(d.concerts);
  })
  .attr("height", y.bandwidth())
  .attr("fill", "white")
  .attr("rx", 9)
  .on("mouseover", showTooltipBar)
  .on("mousemove", moveTooltipBar)
  .on("mouseleave", hideTooltipBar);

//arc

const data_arc = await d3.csv("./assets/NYP_Piano_CSV.csv", (a) => {
  return {
    calc_x: +a.calc_x,
    conc: +a.conc,
    calc_y: +a.calc_y,
    comp: String(a.comp),
    yr: a.yr,
  };
});

// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 1150 - margin.left - margin.right,
  height = 610 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#radial-viz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
var x = d3.scaleLinear().domain([-39, 39]).range([0, width]);
svg.append("g").attr("transform", "translate(0," + height + ")");
//.call(d3.axisBottom(x));//no axis needed

// Add Y axis
var y = d3.scaleLinear().domain([0, 39]).range([height, 0]);
//svg.append("g").call(d3.axisLeft(y)); //no axis needed

// Add dot size
var z = d3
  .scaleSqrt()
  .domain([1, d3.max(data_arc, (a) => a.conc)])
  .range([1, 8]);

//tooltip
// var
// let
// let tooltip = valami
// tooltip = m'sik valami
// const
// const tooltip = valami
// tooltip.classed(alsdjflakd)

const tooltip = d3
  .select("#radial-viz")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background-color", "white")
  .style("border-radius", "5px")
  .style("padding", "10px")
  .style("color", "black");

// Add dots
const circles = svg
  .append("g")
  .selectAll("dot")
  .data(data_arc)
  .enter()
  .append("circle")
  .attr("cx", (a) => x(a.calc_x))
  .attr("cy", (a) => y(a.calc_y))
  //.attr("r", 2)
  .attr("r", (a) => z(a.conc))
  .attr("fill", "white")
  .attr("fill-opacity", 0.7);

//show tooltip
const showTooltip = function (event, a) {
  circles.classed("faded", true);
  event.target.classList.remove("faded");
  event.target.classList.add("highlighted");
  tooltip.style("opacity", 0.9);
  tooltip.style("display", "block");
};

//move tooltip
const moveTooltip = function (event, a) {
  tooltip
    .html(
      a.conc +
        " concerts <br> with piano concertos <br> of " +
        a.comp +
        " in " +
        a.yr
    )
    .style("left", event.offsetX + 10 + "px")
    .style("top", event.offsetY + 5 + "px")
    .style("text-align", "left")
    .style("font-weight", "300");
};

//hide tooltip
const hideTooltip = function (event, a) {
  // tooltip.style("opacity", 0);
  tooltip.style("display", "none");
  circles.classed("faded", false);
  event.target.classList.remove("highlighted");
};

circles
  .on("mouseover", showTooltip)
  .on("mousemove", moveTooltip)
  .on("mouseleave", hideTooltip);
