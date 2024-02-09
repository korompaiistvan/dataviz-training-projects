// @ts-check
/// <reference path="./d3-declaration.d.ts" />
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// constants
const WIDTH = 680;
const HEIGHT = 630;
const MARGIN = {
  top: 60,
  right: 20,
  bottom: 40,
  left: 20,
};
const VIZ_SELECTOR = "#viz";

// Data loading
/** @typedef {{ table: number, year: number, month: number, day: number, week:number, extent: number, missing: number }} Datum */
const DATA_PATH = "./assets/data.csv";

/** @type {d3.DSVParsedArray<Datum>} */
// @ts-ignore
const data = await d3.csv(DATA_PATH, (d) => {
  return {
    table: +d.table,
    year: +d.year,
    month: +d.month,
    day: +d.day,
    week: +d.week,
    extent: +d.extent,
    missing: +d.missing,
  };
});

//add month name based on month number
function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString([], {
    month: "long",
  });
}

function dayOffset(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

//create a simplified list from the data
function calculation() {
  var calculatedListNew = [];
  let m;
  let monthname;
  for (let y = 1980; y <= 2023; y++) {
    var row = -(1980 - y);
    for (let w = 1; w <= 53; w++) {
      var all_extend = 0;
      var nr_of_source = 0;
      m = null;
      for (let index = 0; index < data.length; index++) {
        // Check if data is from North
        //(North Data Source = 1, South Data Source = 2 )
        if (data[index].table !== 1) continue;
        if (data[index].year !== y || data[index].week !== w) continue;

        all_extend += data[index].extent;
        nr_of_source++;
        m = data[index].month;
      }
      var avg = all_extend / nr_of_source;

      monthname = getMonthName(m);
      var itemNew = {
        row: row,
        value: avg,
        year: y,
        week: w,
        month: m,
        monthname: monthname,
      };
      calculatedListNew.push(itemNew);
    }
  }
  for (let index = 0; index < calculatedListNew.length; index++) {
    if (isNaN(calculatedListNew[index].value)) {
      calculatedListNew.splice(index, 1);
    }
  }

  return calculatedListNew;
}

function drawCirclesNewOneScan() {
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  for (let index = 0; index < consolidatedList.length; index++) {
    const datum = consolidatedList[index];
    if (isNaN(datum.value)) continue;

    var xPos = MARGIN.left + consolidatedList[index].week * 12.25;
    var yPos = MARGIN.top + consolidatedList[index].row * 13;

    var colornew = color(consolidatedList[index].value);
    var size = consolidatedList[index].value * 0.35;

    svg
      .append("circle")
      .attr("cx", xPos)
      .attr("cy", yPos)
      .attr("r", size)
      .attr("fill", `${colornew}`)
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `${consolidatedList[index].monthname} ${datum.year} (Week:${
              datum.week
            }) <br> <hr>  ${consolidatedList[index].value.toFixed(
              2
            )}M Km<sup>2</sup>`
          )
          .style("left", event.pageX + 5 + "px")
          .style("top", event.pageY - 25 + "px");
      })
      .on("mouseout", function (event, d) {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  }
}

//set min reference value for line chart
function setMinValue() {
  var minValue = 1000;
  // @ts-ignore
  var minWeek = 0;
  for (let index = 0; index < consolidatedList.length; index++) {
    if (consolidatedList[index].year == 1980) {
      if (minValue > consolidatedList[index].value) {
        minValue = consolidatedList[index].value;
        minWeek = consolidatedList[index].week;
      }
    }
  }
  return minValue;
}

//create max list
function createDataMax() {
  minValue = setMinValue();
  var maxYearValue;
  var maxYearWeek;
  var maxList = [];
  var rownr;
  for (let y = 1980; y <= 2023; y++) {
    maxYearWeek = 0;
    maxYearValue = 0;
    rownr = -(1980 - y - 1);
    for (let w = 1; w <= 53; w++) {
      for (let index = 0; index < consolidatedList.length; index++) {
        if (consolidatedList[index].year == y) {
          if (consolidatedList[index].week == w) {
            //év,sor,hét,átlag,
            if (minValue >= consolidatedList[index].value) {
              //console.log(data[index].extent);
              maxYearValue = consolidatedList[index].value;
              maxYearWeek = consolidatedList[index].week;
              //console.log(1);
            }
          }
        }
      }
    }
    var item = {
      row: rownr,
      //value: maxYearValue,
      //year: y,
      week: maxYearWeek,
    };
    maxList.push(item);
  }
  maxList.pop();

  return maxList;
}

//create min list
function createDataMin() {
  minValue = setMinValue();
  console.log(minValue);
  var minYearValue;
  var minYearWeek;
  var minList = [];
  var rownr;
  for (let y = 2023; y >= 1980; y--) {
    minYearWeek = 0;
    minYearValue = 0;
    rownr = -(1980 - y) + 1;
    for (let w = 53; w >= 1; w--) {
      for (let index = 0; index < consolidatedList.length; index++) {
        if (consolidatedList[index].year == y) {
          if (consolidatedList[index].week == w) {
            //év,sor,hét,átlag,
            if (minValue >= consolidatedList[index].value) {
              //console.log(data[index].extent);
              minYearValue = consolidatedList[index].value;
              minYearWeek = consolidatedList[index].week;
              //console.log(1);
            }
          }
        }
      }
    }
    var item = {
      row: Number(rownr),
      value: minYearValue,
      year: y,
      week: Number(minYearWeek),
    };
    minList.push(item);
  }
  return minList;
}

//add min and max line
function addLines() {
  //create scales
  const y = d3.scaleLinear().domain([0, 44]).range([44, 622]);

  const x = d3.scaleLinear().domain([0, 52]).range([20, 673]);

  var path;
  //create gradient for coloring
  svg
    .append("linearGradient")
    .attr("id", "line-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("y1", 0)
    .attr("x1", x(0))
    .attr("y2", 0)
    .attr("x2", x(53))
    .selectAll("stop")
    .data([
      { offset: "40%", color: "#ffffff" },
      { offset: "70%", color: "#88aebe" },
      { offset: "100%", color: "#ffffff" },
    ])
    .enter()
    .append("stop")
    .attr("offset", function (d) {
      return d.offset;
    })
    .attr("stop-color", function (d) {
      return d.color;
    });

  //add max line
  for (let index = 0; index < maxList.length; index++) {
    /** @type {d3.Line} */
    const line = d3.line();

    line.x((d) => x(d.week)).y((d) => y(d.row));

    path = line(maxList);
  }

  //@ts-ignore
  svg
    .append("path")
    .attr("d", path)
    .attr("stroke", "url(#line-gradient)")
    .attr("fill", "none")
    .attr("stroke-width", "3");

  //add min line
  for (let index = 0; index < minList.length; index++) {
    /** @type {d3.Line} */
    const line = d3.line();

    line.x((d) => x(d.week)).y((d) => y(d.row));
    path = line(minList);
  }
  //@ts-ignore
  svg
    .append("path")
    .attr("d", path)
    .attr("stroke", "url(#line-gradient)")
    .attr("fill", "none")
    .attr("stroke-width", "3");
}

//add "axis", labels, etc...
function addElements() {
  //fake axis 1 for weeks of the year
  svg
    .append("line")
    .style("stroke", "white")
    .style("stroke-width", 1)
    .attr("x1", 28)
    .attr("y1", 40)
    .attr("x2", 158)
    .attr("y2", 40);

  //fake axis2 for the years
  svg
    .append("line")
    .style("stroke", "white")
    .style("stroke-width", 1)
    .attr("x1", 15)
    .attr("y1", 80)
    .attr("x2", 15)
    .attr("y2", 200);

  //arrow line
  svg
    .append("line")
    .style("stroke", "#898989")
    .style("stroke-width", 1)
    .attr("x1", 480)
    .attr("y1", 50)
    .attr("x2", 500)
    .attr("y2", 32);

  //arrow triangle
  svg
    .append("polygon")
    .attr("points", "480,45  475,50  490,50")
    .attr("stroke", "#898989")
    .style("stroke-width", 1)
    .attr("fill", "#898989");

  //text - axis 1
  svg
    .append("text")
    .attr("fill", "#ffffff")
    .attr("x", -60)
    .attr("y", 75)
    .attr("text-anchor", "start")
    .attr("transform-origin", "0% 10%")
    .attr("transform", "rotate(-90)")
    .attr("font-size", "13px")
    .text("Years");

  //text - axis 2
  svg
    .append("text")
    .attr("fill", "#ffffff")
    .attr("x", 28)
    .attr("y", 33)
    .attr("text-anchor", "start")
    .attr("font-size", "13px")
    .text("Weeks of the year");

  //text - annotation
  svg
    .append("text")
    .attr("fill", "#898989")
    .attr("x", 500)
    .attr("y", 30)
    .attr("text-anchor", "start")
    .attr("font-size", "10px")
    .attr("font-style", "italic")
    .text("The minimal extent in 1980");
}

// create svg
const container = document.querySelector(VIZ_SELECTOR);
const svg = d3.create("svg");
const svgNode = svg.node();
if (svgNode) {
  container?.append(svgNode);
}
svg.attr("width", WIDTH).attr("height", HEIGHT).attr("id", "svg");

//circle init

var consolidatedList = calculation();

//color for circles
const extents = consolidatedList.map((d) => d.value);
const extentDomain = d3.extent(extents);
const color = d3
  .scaleSequential()
  // @ts-ignore
  .domain(extentDomain)
  // @ts-ignore
  .range(["#131c1b", "#53859a"]);

// drawCirclesNew();
drawCirclesNewOneScan();
var minValue = setMinValue();
var maxList = createDataMax();
var minList = createDataMin();

addLines();
addElements();
