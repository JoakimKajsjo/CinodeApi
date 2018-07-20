var json;

var chart;

function chartify(type, json, mapData) {

    var obj = JSON.parse(json);
    var mappedData = mapData(obj);
    var keys = Object.keys(mappedData);
    var values = Object.values(mappedData);

    var ctx = document.getElementById("myChart").getContext('2d');
    if(typeof(chart) != "undefined") {
        chart.destroy();
    }
    chart = new Chart(ctx, {
        type: type,
        data: {
            labels: keys,
            datasets: [{
                label: mapData.name,
                data: values,
                backgroundColor: Array(values.length).fill('rgba(54, 162, 235, 0.2)'),
                borderColor: Array(keys.length).fill('rgba(54, 162, 235, 1)'),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}

//Might need to check status in this one?
function assignedConsultantsBySales(obj) {
    var mappedData = {}
    obj.map(function(o){
    mappedData[o.SalesManager] = (mappedData[o.SalesManager] || 0) + 1; 
  })
    return mappedData;
}

//What they make per hour with all current consultants that are working for them
//Might need to check status in this one?
function salesManagerEarnings(obj) {
  var mappedData = {}
  obj.map(function(o){
    mappedData[o.SalesManager] = (mappedData[o.SalesManager] || 0) + o.Rate;
  })
  return mappedData;
}

function averageRateBySalesManager(obj) {
  var cumulativeRate = 0
  obj.forEach(function(o) {
    cumulativeRate += o.Rate
  })
  averageRate = cumulativeRate/Object.keys(obj).length;
  return {"rate": averageRate}
}

function assignedConsultantsByTeams(obj) {
  var mappedData = {}
    obj.map(function(o){
    mappedData[o.Team] = (mappedData[o.Team] || 0) + 1;
  })
  return mappedData;
}

function partnerMalmöSthlm(obj) {
  var consultants = assignedConsultantsByTeams(obj);
  return {"Malmö partner": consultants["Partner Malmö"], "Sthlm partner": consultants["Partner Sthlm"]}
}

function highestHourlyRate(obj) {
    var mappedData = {}
    obj.forEach(function(o){
        if (typeof(mappedData[o.SalesManager]) == "undefined" || mappedData[o.SalesManager] < o.Rate) mappedData[o.SalesManager] = o.Rate;
    })
    return mappedData;
}

var now = new Date();
var delay = 60 * 60 * 100; // 1 hour in msec
var start = delay - (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds();

var currentChartType = "bar";
var currentMapper = salesManagerEarnings;
function setCurrentChartOptionsAndChartify(type, json, mapData) {
    currentMapper = mapData;
    currentChartType = type;
    console.log(mapData)
    chartify(type, json, mapData)
}

function getAndDisplayCurrentData() {
   axios.get('http://localhost:8080/json')
     .then(function (response) {
       json = response.data;
       chartify(currentChartType, json, currentMapper);
     })
     .catch(function (error) {
       console.log(error);
     })
   setTimeout(getAndDisplayCurrentData, delay);
};

getAndDisplayCurrentData();
