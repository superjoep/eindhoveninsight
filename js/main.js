const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const nameBuurt = capitalizeFirstLetter(urlParams.get('neighborhood'));
document.getElementById("NeighborhoodName").innerHTML = nameBuurt;
var regionSelect = [];

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://data.eindhoven.nl/api/records/1.0/search/?dataset=buurten&q=&facet=buurtcode&facet=buurtnaam&facet=wijkcode&facet=wijknaam&refine.buurtnaam=" + nameBuurt,
    "method": "GET",
};

$.ajax(settings).done(function(response) {
    coordinaten = (response['records'][0]['fields']['geo_shape']['coordinates'][0]);
    for (let i = 0; i < coordinaten.length; i++) {
        regionSelect.push([coordinaten[i][1], coordinaten[i][0]]);
    }
    polygon = L.polygon(regionSelect);
    polygon.addTo(mymap)
});


var coordinaten;
var mymap = L.map('map').setView([51.441642, 5.4697225], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiaGltdG94aWMiLCJhIjoiY2t2bThmbGQxMHY5dDMya2x4ZTR4NTU3byJ9.uTKsn_lb2YNdMrz8bJqIxA'
}).addTo(mymap);


//Amenities
//Show the median age group in the amenities
axios.get('https://opendata.cbs.nl/ODataApi/odata/84799NED/UntypedDataSet?$filter=WijkenEnBuurten%20eq%20%27BU07722110%27')
    .then(res => {
        const dataAge = res.data.value[0];
        const age1 = parseInt(dataAge.k_0Tot15Jaar_8);
        const age2 = parseInt(dataAge.k_15Tot25Jaar_9);
        const age3 = parseInt(dataAge.k_25Tot45Jaar_10);
        const age4 = parseInt(dataAge.k_45Tot65Jaar_11);
        const age5 = parseInt(dataAge.k_65JaarOfOuder_12);

        if (age1 > age2 && age1 > age3 && age1 > age4 && age1 > age5) {
            document.getElementById("medianAge").innerHTML = "0-15";
        } else if (age2 > age1 && age2 > age3 && age2 > age4 && age2 > age5) {
            document.getElementById("medianAge").innerHTML = "15-25";
        } else if (age3 > age1 && age3 > age2 && age3 > age4 && age3 > age5) {
            document.getElementById("medianAge").innerHTML = "25-45";
        } else if (age4 > age1 && age4 > age2 && age4 > age3 && age4 > age5) {
            document.getElementById("medianAge").innerHTML = "45-65";
        } else {
            document.getElementById("medianAge").innerHTML = "65+";
        }
    });

// show the safety rating in the amenities
ratingNeighbourhood();

async function ratingNeighbourhood() {
    //Calculate the total crime rate from a certain neighbourhood
    const dataCrimeIrisbuurt = await fetch('../img/crimiIrisbuurt.csv');
    const dataSafetyIrisbuurt = await dataCrimeIrisbuurt.text();

    let countIrisbuurt = 0;
    const tableIrisbuurt = dataSafetyIrisbuurt.split('\n');

    tableIrisbuurt.forEach(rowIrisbuurt => {
        const columnsIrisbuurt = rowIrisbuurt.split(';');
        const numbersIrisbuurt = columnsIrisbuurt[1];
        countIrisbuurt = countIrisbuurt + parseFloat(numbersIrisbuurt);
    })

    const crimeTotalIrisbuurt = countIrisbuurt.toFixed(1);

    //Calculate the total crime rate from Eindhoven
    const dataCrimeEindhoven = await fetch("../img/crimiEindhoven.csv");
    const dataSafetyEindhoven = await dataCrimeEindhoven.text();

    let countEindhoven = 0;
    const tableEindhoven = dataSafetyEindhoven.split("\n");

    tableEindhoven.forEach(rowEindhoven => {
        const columnsEindhoven = rowEindhoven.split(";");
        const numbersEindhoven = columnsEindhoven[1];
        countEindhoven = countEindhoven + parseFloat(numbersEindhoven)
    })

    const crimeTotalEindhoven = countEindhoven.toFixed(1);

    //Calculate what rating the neighbourhood gets if Eindhoven were a 5.5
    const crimeRatingAmount = crimeTotalEindhoven / 11

    if (crimeTotalIrisbuurt <= crimeRatingAmount && crimeTotalIrisbuurt >= 0) {
        document.getElementById("safetyRating").innerHTML = "10";
    } else if (crimeTotalIrisbuurt <= crimeRatingAmount * 3 && crimeTotalIrisbuurt > crimeRatingAmount) {
        document.getElementById("safetyRating").innerHTML = "9";
    } else if (crimeTotalIrisbuurt <= crimeRatingAmount * 5 && crimeTotalIrisbuurt > crimeRatingAmount * 3) {
        document.getElementById("safetyRating").innerHTML = "8";
    } else if (crimeTotalIrisbuurt <= crimeRatingAmount * 7 && crimeTotalIrisbuurt > crimeRatingAmount * 5) {
        document.getElementById("safetyRating").innerHTML = "7";
    } else if (crimeTotalIrisbuurt <= crimeRatingAmount * 9 && crimeTotalIrisbuurt > crimeRatingAmount * 7) {
        document.getElementById("safetyRating").innerHTML = "6";
    } else if (crimeTotalIrisbuurt <= crimeRatingAmount * 11 && crimeTotalIrisbuurt > crimeRatingAmount * 9) {
        document.getElementById("safetyRating").innerHTML = "5";
    } else if (crimeTotalIrisbuurt <= crimeRatingAmount * 13 && crimeTotalIrisbuurt > crimeRatingAmount *
        11) {
        document.getElementById("safetyRating").innerHTML = "4";
    } else if (crimeTotalIrisbuurt <= crimeRatingAmount * 15 && crimeTotalIrisbuurt > crimeRatingAmount *
        13) {
        document.getElementById("safetyRating").innerHTML = "3";
    } else if (crimeTotalIrisbuurt <= crimeRatingAmount * 17 && crimeTotalIrisbuurt >
        crimeRatingAmount * 15) {
        document.getElementById("safetyRating").innerHTML = "2";
    } else {
        document.getElementById("safetyRating").innerHTML = "1";
    }
};

$.get(
    "https://odata4.cbs.nl/CBS/84799NED/WijkenEnBuurtenCodes?$filter=DimensionGroupId%20eq%20%27GM0772%27%20and%20Title%20eq%20%27" +
    nameBuurt +
    "%27",
    function(data) {
        $.get(
            "https://opendata.cbs.nl/ODataApi/odata/84799NED/UntypedDataSet?$filter=WijkenEnBuurten%20eq%20%27" +
            data["value"][0]["Identifier"] +
            "%27",
            function(data) {
                // BU07722140 Tuindorp
                between08 = parseInt(data["value"][0]["k_0Tot15Jaar_8"]);
                between1525 = parseInt(data["value"][0]["k_15Tot25Jaar_9"]);
                between2545 = parseInt(data["value"][0]["k_25Tot45Jaar_10"]);
                between4511 = parseInt(data["value"][0]["k_45Tot65Jaar_11"]);
                plus65 = parseInt(data["value"][0]["k_65JaarOfOuder_12"]);
                total =
                    between08 + between1525 + between2545 + between4511 + plus65;

                document.getElementById("between08").innerHTML +=
                    '<div class="bar"></div><div class="percentage">' +
                    Math.round((between08 / total) * 1000) / 10 +
                    "%</div>" +
                    '<div class="bartest"></div>';
                document.querySelector(
                        ".bar-graph-one .bar-one .bar"
                    ).style.width =
                    Math.round((between08 / total) * 1000) / 10 + "%";

                document.getElementById("between1525").innerHTML +=
                    '<div class="bar"></div><div class="percentage">' +
                    Math.round((between1525 / total) * 1000) / 10 +
                    "%</div>" +
                    '<div class="bartest"></div>';
                document.querySelector(
                        ".bar-graph-one .bar-two .bar"
                    ).style.width =
                    Math.round((between1525 / total) * 1000) / 10 + "%";

                document.getElementById("between2545").innerHTML +=
                    '<div class="bar"></div><div class="percentage">' +
                    Math.round((between2545 / total) * 1000) / 10 +
                    "%</div>" +
                    '<div class="bartest"></div>';
                document.querySelector(
                        ".bar-graph-one .bar-three .bar"
                    ).style.width =
                    Math.round((between2545 / total) * 1000) / 10 + "%";

                document.getElementById("between4511").innerHTML +=
                    '<div class="bar"></div><div class="percentage">' +
                    Math.round((between4511 / total) * 1000) / 10 +
                    "%</div>" +
                    '<div class="bartest"></div>';
                document.querySelector(
                        ".bar-graph-one .bar-four .bar"
                    ).style.width =
                    Math.round((between4511 / total) * 1000) / 10 + "%";

                document.getElementById("plus65").innerHTML +=
                    '<div class="bar"></div><div class="percentage">' +
                    Math.round((plus65 / total) * 1000) / 10 +
                    "%</div>" +
                    '<div class="bartest"></div>';
                document.querySelector(
                    ".bar-graph-one .bar-five .bar"
                ).style.width = Math.round((plus65 / total) * 1000) / 10 + "%";
            }
        );
    }
);

// Graph crime starts here
// FETCHING DATA AND PUSH ON TABLE OF EINDHOVEN
async function getData(){
    const xs = [];
    const ys = [];

    const response = await fetch('../img/crimiEindhoven.csv');
    const data = await response.text();

    const table = data.split('\n');
    table.forEach(row => {
        const columns = row.split(';');
        const sort = columns[0];
        xs.push(sort);
        const percentage = columns[1];
        ys.push(parseFloat(percentage));
        console.log(sort, percentage);
    });
    return{ xs, ys };
}

// FETCHING DATA AND PUSH ON TABLE OF IRISBUURT
async function getData2(){
    const xs2 = [];
    const ys2 = [];

    const response = await fetch('../img/crimiIrisbuurt.csv');
    const data = await response.text();

    const table = data.split('\n');
    table.forEach(row => {
        const columns = row.split(';');
        const sort = columns[0];
        xs2.push(sort);
        const percentage = columns[1];
        ys2.push(parseFloat(percentage));
        console.log(sort, percentage);
    });
    return{ xs2, ys2 };
}

// CREATING CHART AND DISPLAY DATA
chartIt();

async function chartIt() {
    const data = await getData();
    const data2 = await getData2();
    const ctx = document.getElementById('myChart').getContext('2d');

    Chart.defaults.font.family = "'Montserrat', sans-serif"

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.xs,
            datasets: 
            [{
                label: 'Eindhoven',
                labels: data.xs,
                data: data.ys,
                backgroundColor: 'rgba(30, 217, 34, 0.2)',
                borderColor: 'rgba(30, 217, 34, 1)',
                borderWidth: 1,
                fill: true,
                animations:{
                    y:{
                        duration: 3000,
                        delay: 500
                    }
                }
            },
            {
                label: 'Irisbuurt',
                data: data2.ys2,
                backgroundColor: 'rgba(0, 255, 139, 0.5)',
                borderColor: 'rgba(0, 255, 139, 1)',
                borderWidth: 1,
                fill: true,
                animations:{
                    y:{
                        duration: 3000
                    }
                }
            }],
        },
        options:{
            responsive: true,
            plugins: {
                 legend: {
                     position: 'right'
                    },
                 title: {
                    display: true,
                    text: 'Registrated crime in Eindhoven and Irisbuurt in 2020 per 1,000 inhabitants'
                },
                tooltip:{
                    enabled: false,
                    position: 'nearest',
                    external: externalTooltipHandler
                }, 
             },
             interaction:{
                 intersect: false,
                 mode: 'index'
             },
             scales:{
                y:{
                    min: 0,
                    max: 20,
                    ticks:{
                        stepSize: 5
                    }
                }
            },
            animation:{
                y:{
                    easing: 'easeOutElastic',
                    from: (ctx) =>{
                        if(ctx.type === 'data'){
                            if(ctx.mode === 'default' && !ctx.dropped){
                                ctx.dropped = true;
                                return 0;
                            }
                        }
                    }
                }
            }   
         }
    });
}

// TOOLTIP PART OF CRIME RATES CHARTS STARTS HERE
const getOrCreateTooltip = (chart) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');
  
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.style.background = 'rgba(255, 255, 255, 0.6)';
      tooltipEl.style.borderWidth = 10;
      tooltipEl.style.borderColor =  'rgb(100, 50, 100)';
      tooltipEl.style.borderRadius = '3px';
      tooltipEl.style.color = 'black';
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.transition = 'all .5s ease';
  
      const table = document.createElement('table');
      table.style.margin = '0px';
  
      tooltipEl.appendChild(table);
      chart.canvas.parentNode.appendChild(tooltipEl);
    }
  
    return tooltipEl;
  };
  
  const externalTooltipHandler = (context) => {
    // Tooltip Element
    const {chart, tooltip} = context;
    const tooltipEl = getOrCreateTooltip(chart);
  
    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }
  
    // Set Text
    if (tooltip.body) {
      const titleLines = tooltip.title || [];
      const bodyLines = tooltip.body.map(b => b.lines);
  
      const tableHead = document.createElement('thead');
  
      titleLines.forEach(title => {
        const tr = document.createElement('tr');
        tr.style.borderWidth = 0;
  
        const th = document.createElement('th');
        th.style.borderWidth = 0;
        const text = document.createTextNode(title);
  
        th.appendChild(text);
        tr.appendChild(th);
        tableHead.appendChild(tr);
      });
  
      const tableBody = document.createElement('tbody');
      bodyLines.forEach((body, i) => {
        const colors = tooltip.labelColors[i];
  
        const span = document.createElement('span');
        span.style.background = colors.backgroundColor;
        span.style.borderColor = colors.borderColor;
        span.style.borderWidth = '2px';
        span.style.marginRight = '10px';
        span.style.height = '10px';
        span.style.width = '10px';
        span.style.display = 'inline-block';
  
        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'inherit';
        tr.style.borderWidth = 0;
  
        const td = document.createElement('td');
        td.style.borderWidth = 0;
  
        const text = document.createTextNode(body);
  
        td.appendChild(span);
        td.appendChild(text);
        tr.appendChild(td);
        tableBody.appendChild(tr);
      });
  
      const tableRoot = tooltipEl.querySelector('table');
  
      // Remove old children
      while (tableRoot.firstChild) {
        tableRoot.firstChild.remove();
      }
  
      // Add new children
      tableRoot.appendChild(tableHead);
      tableRoot.appendChild(tableBody);
    }
  
    const {Left: positionX, Top: positionY} = chart.canvas;
  
    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
  };