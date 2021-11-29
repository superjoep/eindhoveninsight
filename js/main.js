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